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

var config = require("../config");

var installPlistTemplate = require('./template').installPlistTemplate;

stringformat.extendString('coolFormat');

function createInstallFiles(appInfo) {
    var ipaurl = config.IPAInstallURLbase + appInfo.storageID + "/" + appInfo.fileName;
    var plistContent = installPlistTemplate.coolFormat({appurl: ipaurl, bundleid: appInfo.bundleid, version: appInfo.version, title: appInfo.title});
    var plistPath = path.join(appInfo.basePath, config.installPlistName);
    fs.writeFileSync(plistPath, plistContent, 'utf8');
}

router.post('/', multipartMiddleware, function (req, res) {
    var appInfo = new AppInfo();

    debug("APP ID:" + appInfo.appID);

    appInfo.storageID = uuid.v1();

    // 保存基本路径,方便后续使用
    var savePath = path.join(config.appStoragePath + appInfo.storageID);
    debug("base path:" + savePath);
    appInfo.basePath = savePath;
    appInfo.fileName = config.appName;
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

                var iconPath = path.join(parseResult.basePath, config.iconName);
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
