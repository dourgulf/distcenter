var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:upload');

var stringformat = require('stringformat');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

var multipartMiddleware = require('connect-multiparty')();

var dbservice = require('./dbservice');
var ipapaser = require('./ipa/ipaparser');
var IPAInfo = require('./ipa/ipainfo');

var baseFilePath = path.join(__dirname, '../uploads/ipa/');

// TODO: change to configuration file
var IPAInstallURLbase = require("../config").IPAInstallURLbase;
var installPlistName = "install.plist";
var installHTMLName = "install.html";

var installPlistTemplate = require('./template').installPlistTemplate

var installHTMLTemplate = require('./template').installHTMLTemplate

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

    ipaInfo.iconURL = "/ipa/" + ipaInfo.ipaID + "/icon.png";

    // 用个HTML文件来包裹AppStore的条件链接
    var htmlContent = installHTMLTemplate.coolFormat({AppTitle: ipaInfo.title, itmsURL: itmsURL, iconURL: ipaInfo.iconURL});
    var htmlPath = path.join(ipaInfo.basePath, installHTMLName);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

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
    fs.symlinkSync("../../../public/css/", "css");
    fs.symlinkSync("../../../public/images/", "images");
    fs.symlinkSync("../../../public/js/", "js");


    // IPA文件路径
    savePath = path.join(ipaInfo.basePath, ipaInfo.fileName);
    fs.renameSync(req.files.file.path, savePath);
    ipapaser.parse(ipaInfo, function (parseResult) {
        if (parseResult.error) {
            res.send(JSON.stringify(parseResult));
        }
        else {
            createInstallFiles(parseResult);
            delete parseResult.basePath
            dbservice.saveIPAInfo(ipaInfo, "-1", function () {
                res.send(JSON.stringify(parseResult));
            })
        }
    });
});

module.exports = router;
