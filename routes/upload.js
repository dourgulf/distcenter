var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:upload');

var stringformat = require('stringformat');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

var multipartMiddleware = require('connect-multiparty')();

var dbservice = require('../controllers/storage/dbservice');
var ipapaser = require('../controllers/ipa/ipaparser');
var IPAInfo = require('../controllers/ipa/ipainfo');

var baseFilePath = path.join(__dirname, '../uploads/ipa/');

// TODO: change to configuration file
var IPAInstallURLbase = "https://192.168.11.116:3001/ipa/";
var installPlistName = "install.plist";
var installHTMLName = "install.html";

var installPlistTemplate = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>items</key>',
    '  <array>',
    '	<dict>',
    '	  <key>assets</key>',
    '	  <array>',
    '		<dict>',
    '		  <key>kind</key>',
    '		  <string>software-package</string>',
    '		  <key>url</key>',
    '		  <string>{appurl}</string>',
    '		</dict>',
    '	  </array>',
    '	  <key>metadata</key>',
    '	  <dict>',
    '		<key>bundle-identifier</key>',
    '		<string>{bundleid}</string>',
    '		<key>bundle-version</key>',
    '		<string>{version}</string>',
    '		<key>kind</key>',
    '		<string>software</string>',
    '		<key>title</key>',
    '		<string>{title}</string>',
    '	  </dict>',
    '	</dict>',
    '  </array>',
    '</dict>',
    '</plist>',
].join('\n');

var installHTMLTemplate = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta http-equiv="Content-Style-Type" content="text/css">',
    '  <title>{title}</title>',
    //'  <script language="javascript" type="text/javascript">',
    //'    window.location.href="{itmsURL}"',
    //'  </script>',
    '</head>',
    '<body>',
    '  <p>提示用户使用Safari打开</p>',
    '</body>',
    '</html>',
    '',
].join("\n");

var itmsURLTemplate = 'itms-services://?action=download-manifest&url={plisturl}';

stringformat.extendString('coolFormat');

function createInstallFiles(ipaInfo) {
    // IPA 文件的下载链接,它是一个完整的HTTPS下载地址
    var ipaurl = IPAInstallURLbase + ipaInfo.ipaID + "/" + ipaInfo.fileName;
    // 包含IPA下载信息的Plist文件的下载链接
    var plistURL = IPAInstallURLbase + ipaInfo.ipaID + "/" + installPlistName;

    //  AppStore跳转协议链接
    var itmsURL = itmsURLTemplate.coolFormat({plisturl: plistURL});

    // 生成Plist具体文件内容
    var plistContent = installPlistTemplate.coolFormat({appurl: ipaurl, bundleid: ipaInfo.bundleid, version: ipaInfo.version, title: ipaInfo.title});
    var plistPath = path.join(ipaInfo.basePath, installPlistName);
    fs.writeFileSync(plistPath, plistContent, 'utf8');

    // 用个HTML文件来包裹AppStore的条件链接
    var htmlContent = installHTMLTemplate.coolFormat({title: ipaInfo.title, itmsURL: itmsURL});
    var htmlPath = path.join(ipaInfo.basePath, installHTMLName);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    ipaInfo.iconURL = "ipa/" + ipaInfo.ipaID + "/icon.png";
}

router.post('/', multipartMiddleware, function (req, res) {
    var ipaInfo = new IPAInfo();

    debug("IPA ID:" + ipaInfo.ipaID);

    // 保存基本路径,方便后续使用
    var savePath = path.join(baseFilePath + ipaInfo.ipaID);
    debug("base path:" + savePath);
    ipaInfo.basePath = savePath;
    ipaInfo.fileName = req.files.file.originalFilename;
    mkdirp.sync(savePath);

    // IPA文件路径
    savePath = path.join(ipaInfo.basePath, ipaInfo.fileName);
    fs.renameSync(req.files.file.path, savePath);
    ipaInfo.filePath = savePath;
    ipapaser.parse(ipaInfo, function (parseResult) {
        if (parseResult.error) {
            res.send(JSON.stringify(parseResult));
        }
        else {
            createInstallFiles(parseResult);
            parseResult.basePath = '';
            dbservice.saveIPAInfo(ipaInfo, "-1", function () {
                res.send(JSON.stringify(parseResult));
            })
        }
    });
});

module.exports = router;
