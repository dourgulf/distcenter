/**
 * Created by DarwinRie on 16/1/26.
 */
var path = require("path");
module.exports.mysqlConfigure = {
    host     : 'localhost',
    user     : 'distcenter',
    password : 'distcenternopass',
    database : 'distcenter'
};

module.exports.IPAInstallURLbase = "https://www.dawenhing.top/ipa/";

// Only iMac
// xcrun pngcrush -revert-iphone-optimizations {src} {dst}

// TODO: set the relative path
uncrushpngpy = path.join(path.join(__dirname), "exec/uncrushpng.py")
module.exports.uncrashIconCmd = 'python ' + uncrushpngpy + ' "{src}" "{dst}" ';

module.exports.appStoragePath = path.join(__dirname, 'uploads/ipa/');
module.exports.installPlistName = "install.plist";
module.exports.appName = "theApp";
module.exports.iconName = "icon.png";
