/**
 * Created by DarwinRie on 16/1/26.
 */

var path = require("path");

module.exports.mysqlConfigure = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'distcenter'
};

module.exports.IPAInstallURLbase = "http://192.168.11.116:3002/uploads/ipa/";

// Only iMac
module.exports.uncrashIconCmd = 'xcrun pngcrush -revert-iphone-optimizations "{src}" "{dst}"'
//module.exports.uncrashIconCmd = 'python /Users/jinchudarwin/WebstormProjects/distcenter/exec/uncrushpng.py "{src}" "{dst}" ';

module.exports.appStoragePath = path.join(__dirname, 'public/uploads/ipa/');
module.exports.installPlistName = "install.plist";
module.exports.appName = "theApp";
module.exports.iconName = "icon.png";