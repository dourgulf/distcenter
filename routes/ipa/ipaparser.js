/**
 * Created by Darwin Rie on 16/1/13.
 */

var fs = require('fs');
var rmdir = require('rimraf');
var path = require('path');
var exec = require('child_process').exec;
var stringformat = require('stringformat');
stringformat.extendString('coolFormat');

var uncrashIconCmd = require("../../config").uncrashIconCmd;
var DecompressZip = require('decompress-zip');
var plist = require('plist');
var bplist = require('bplist-parser')
var debug = require('debug')('distcenter:ipa');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function parsePlistData(contents) {
    var results,
        firstByte = contents[0];

    if (contents.length === 0) {
        console.error("Unable to read file '%s'", aFile);
        return {};
    }

    try {
        if (firstByte === 60) {
            results = plist.parse(contents.toString());
        }
        else if (firstByte === 98) {
            results = bplist.parseBuffer(contents)[0];
        }
        else {
            console.error("Unable to determine format for '%s'", firstByte);
            results = {};
        }
    }
    catch(e) {
        throw Error("Plist data has errors");
    }
    return results;
};

function parseInfoPlist(ipaInfo, fn) {
    var basepath = ipaInfo.basePath;
    var infoPlist = path.join(basepath, "Payload");
    var payloadDirs = fs.readdirSync(infoPlist);
    var appDir;
    for (var i=0; i<payloadDirs.length; i++) {
        if (endsWith(payloadDirs[i], ".app")){
            appDir = payloadDirs[i];
            break;
        }
    }
    if (!appDir) {
        fn({error: '解析IPA错误'});
        return ;
    }

    appDir = path.join(infoPlist, appDir);
    infoPlist = path.join(appDir, "Info.plist");
    debug("Parsing Info.plist: " + infoPlist);
    fs.readFile(infoPlist, function (err, plistData) {
        if (err) {
            console.log("Read Info.plist error:" + err.message);
            fn({error: err.message});
            return;
        }
        var plistObj = parsePlistData(plistData);
        ipaInfo.bundleid = plistObj['CFBundleIdentifier'] || '';
        ipaInfo.version = plistObj['CFBundleShortVersionString'] || '';
        ipaInfo.buildVersion = plistObj['CFBundleVersion'] || '';
        ipaInfo.requireOSVersion = plistObj['MinimumOSVersion'];
        ipaInfo.title = plistObj['CFBundleName'];
        // 直接写Icon的情况
        var iconList = [path.join(appDir, "Icon@2x.png"),
            path.join(appDir, "Icon.png")];
        // 用assert的情况
        var cxassertIcons = (((plistObj['CFBundleIcons'] || {})['CFBundlePrimaryIcon'] || {})['CFBundleIconFiles'] || ['']);
        if (cxassertIcons.length > 0) {
            cxassertIcon = cxassertIcons[cxassertIcons.length-1];
            if (endsWith(cxassertIcon, '.png')) {
                iconList.push(path.join(appDir, cxassertIcon));
            }
            else {
                iconList.push(path.join(appDir, cxassertIcon + "@3x.png"));
                iconList.push(path.join(appDir, cxassertIcon + "@2x.png"));
                iconList.push(path.join(appDir, cxassertIcon + ".png"));
            }
        }
        // iPad assets的情况
        var cxassertIcons = (((plistObj['CFBundleIcons~ipad'] || {})['CFBundlePrimaryIcon'] || {})['CFBundleIconFiles'] || ['']);
        if (cxassertIcons.length > 0) {
            cxassertIcon = cxassertIcons[cxassertIcons.length-1];
            if (endsWith(cxassertIcon, '.png')) {
                iconList.push(path.join(appDir, cxassertIcon));
            }
            else {
                iconList.push(path.join(appDir, cxassertIcon + "@3x~ipad.png"));
                iconList.push(path.join(appDir, cxassertIcon + "@2x~ipad.png"));
                iconList.push(path.join(appDir, cxassertIcon + "~ipad.png"));
            }
        }

        for (var i=0; i<iconList.length; i++) {
            var iconPath = iconList[i];
            if (fs.existsSync(iconPath)) {
                debug("Using icon:" + iconPath);
                fs.renameSync(iconPath, path.join(basepath, "icon_iOS.png"));
                break;
            }
        }
        // 删除非空目录
        rmdir.sync(path.join(basepath, "Payload"));
        uncrushIconImage(path.join(basepath, "icon_iOS.png"), path.join(basepath, "icon.png"), function() {
            fn(ipaInfo);
        });
    });
}

function uncrushIconImage(from, to, fn) {
    var cmd = uncrashIconCmd.coolFormat({src: from, dst: to})
    debug("convert icon command:" + cmd)
    exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.error("Convert icon error:" + error.message);
        }
        fn();
    });
}

function parse(ipaInfo, fn) {
    var basepath = ipaInfo.basePath;
    var unzipper = new DecompressZip(path.join(basepath, ipaInfo.fileName))

    unzipper.on('error', function (err) {
        console.error('Caught an error:', err);
    });

    unzipper.on('extract', function (log) {
        debug('Finished extracting');
        parseInfoPlist(ipaInfo, fn);
    });

    unzipper.on('progress', function (fileIndex, fileCount) {
        //debug('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
    });

    unzipper.extract({
        path: basepath,
        filter: function (file) {
            return file.type !== "SymbolicLink";
        }
    });
}

exports.parse = parse;

