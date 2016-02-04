/**
 * Created by DarwinRie on 16/1/14.
 */

var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:download');

var stringformat = require('stringformat');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');


var dbservice = require('./dbservice');

var baseFilePath = require("../config").appStoragePath;

var installPlistTemplate = require('./template').installPlistTemplate

var installHTMLTemplate = require('./template').installHTMLTemplate

var itmsURLTemplate = 'itms-services://?action=download-manifest&url={plisturl}';

stringformat.extendString('coolFormat');

function makeResponse(ipaInfo) {
    // IPA 文件的下载链接,它是一个完整的HTTPS下载地址
    var ipaurl = IPAInstallURLbase + ipaInfo.appID + "/" + ipaInfo.fileName;
    // 包含IPA下载信息的Plist文件的下载链接
    var plistURL = IPAInstallURLbase + ipaInfo.appID + "/" + installPlistName;

    //  AppStore跳转协议链接
    var itmsURL = itmsURLTemplate.coolFormat({plisturl: plistURL});

    // 生成Plist具体文件内容
    var plistContent = installPlistTemplate.coolFormat({appurl: ipaurl, bundleid: ipaInfo.bundleid, version: ipaInfo.version, title: ipaInfo.title});
    var plistPath = path.join(ipaInfo.basePath, installPlistName);
    fs.writeFileSync(plistPath, plistContent, 'utf8');

    ipaInfo.iconURL = "/ipa/" + ipaInfo.storageID + "/icon.png";

    // 用个HTML文件来包裹AppStore的条件链接
    var htmlContent = installHTMLTemplate.coolFormat({AppTitle: ipaInfo.title, itmsURL: itmsURL, iconURL: ipaInfo.iconURL});
    var htmlPath = path.join(ipaInfo.basePath, installHTMLName);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

}

router.get('/', function (req, res) {
    var appID = req.query.appID;
    var userID = req.query.userID;
    debug("appID:" + appID);
    debug("userID:" + userID);
    dbservice.queryAppInfo(appID, userID, function (err, appInfo) {
        if (err) {
            res.render('error', {
                message: "Can't query this app:" + appID,
                error: error
            });
            return ;
        }

        appInfo.basePath = path.join(baseFilePath, appInfo.storageID);
        var buildInfo = appInfo.version + "(" + appInfo.buildVersion + ")";
        var iconPath = path.join(appInfo.basePath, "/icon.png");
        var contentParams = {AppTitle: appInfo.title, BuildInfo: buildInfo}
        var ipaurl = IPAInstallURLbase + appInfo.storageID + "/app.ipa";
        var plistURL = IPAInstallURLbase + ipaInfo.appID + "/" + installPlistName;

    //  AppStore跳转协议链接
    var itmsURL = itmsURLTemplate.coolFormat({plisturl: plistURL});
        fs.readFile(iconPath, function (err, iconData) {
            if (!err) {
                contentParams.iconURL = "data:image/png;base64," + iconData.toString("base64");
            }
            var htmlContent = installHTMLTemplate.coolFormat(contentParams);
            res.send(htmlContent);
        });

    })
});

module.exports = router;
