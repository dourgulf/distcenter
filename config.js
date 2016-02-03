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

module.exports.IPAInstallURLbase = "http://localhost:3000";

// Only iMac
// xcrun pngcrush -revert-iphone-optimizations {src} {dst}
module.exports.uncrashIconCmd = 'python /Users/jinchudarwin/WebstormProjects/distcenter/exec/uncrushpng.py "{src}" "{dst}" ';

module.exports.appStoragePath = path.join(__dirname, 'uploads/ipa/');
