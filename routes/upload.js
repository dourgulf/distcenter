var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:upload');

var stringformat = require('stringformat');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var multipartMiddleware = require('connect-multiparty')();

var dbservice = require('./dbservice');
var ipapaser = require('./ipa/ipaparser');
var AppInfo = require('./ipa/appinfo');

var baseFilePath = require("../config").appStoragePath;

// TODO: change to configuration file
var IPAInstallURLbase = require("../config").IPAInstallURLbase;
var installPlistName = "install.plist";
var installHTMLName = "install.html";

var installPlistTemplate = require('./template').installPlistTemplate

var installHTMLTemplate = require('./template').installHTMLTemplate

var itmsURLTemplate = 'itms-services://?action=download-manifest&url={plisturl}';

stringformat.extendString('coolFormat');

function createInstallFiles(appInfo) {
    // IPA 文件的下载链接,它是一个完整的HTTPS下载地址
    var ipaurl = IPAInstallURLbase + appInfo.storageID "/" + appInfo.fileName;
    // 包含IPA下载信息的Plist文件的下载链接
    var plistURL = IPAInstallURLbase + appInfo.storageID + "/" + installPlistName;

    //  AppStore跳转协议链接
    var itmsURL = itmsURLTemplate.coolFormat({plisturl: plistURL});

    // 生成Plist具体文件内容
    var plistContent = installPlistTemplate.coolFormat({appurl: ipaurl, bundleid: appInfo.bundleid, version: appInfo.version, title: appInfo.title});
    var plistPath = path.join(appInfo.basePath, installPlistName);
    fs.writeFileSync(plistPath, plistContent, 'utf8');

    // 用个HTML文件来包裹AppStore的条件链接
    var htmlContent = installHTMLTemplate.coolFormat({AppTitle: appInfo.title, itmsURL: itmsURL, iconURL: appInfo.iconURL});
    var htmlPath = path.join(appInfo.basePath, installHTMLName);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
}

router.post('/', multipartMiddleware, function (req, res) {
    var appInfo = new AppInfo();

    debug("APP ID:" + appInfo.appID);

    appInfo.storageID = uuid.v1();

    // 保存基本路径,方便后续使用
    var savePath = path.join(baseFilePath + appInfo.storageID);
    debug("base path:" + savePath);
    appInfo.basePath = savePath;
    appInfo.fileName = "app.ipa";  //req.files.file.originalFilename;
    mkdirp.sync(savePath);

    // IPA文件路径
    savePath = path.join(appInfo.basePath, appInfo.fileName);
    fs.renameSync(req.files.file.path, savePath);
    ipapaser.parse(appInfo, function (parseResult) {
        if (parseResult.error) {
            res.send(JSON.stringify(parseResult));
        }
        else {
            createInstallFiles(parseResult);
            dbservice.saveAppInfo(appInfo, "-1", function (err) {
                if (err) {
                    res.send(JSON.stringify({status: -1}));
                    return ;
                }

                var iconPath = path.join(parseResult.basePath, "/icon.png");
                debug(iconPath);
                fs.readFile(iconPath, function (err, iconData) {
                    if (!err) {
                        var iconDataString = "data:image/png;base64," + iconData.toString("base64");
                        res.send(JSON.stringify({status:0, appID: parseResult.appID, iconURL: iconDataString}));
                    }
                });
            })
        }
    });
});

module.exports = router;
