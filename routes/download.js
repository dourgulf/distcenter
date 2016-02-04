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

var config = require("../config");
var baseFilePath = config.appStoragePath;
var IPAInstallURLbase = config.IPAInstallURLbase;
var installPlistName = config.installPlistName;

var installHTMLTemplate = require('./template').installHTMLTemplate

var itmsURLTemplate = 'itms-services://?action=download-manifest&url={plistURL}';

stringformat.extendString('coolFormat');

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
        var plistURL = IPAInstallURLbase + appInfo.storageID + "/" + installPlistName;
        contentParams.itmsURL = itmsURLTemplate.coolFormat({plistURL: plistURL});
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
