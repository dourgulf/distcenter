/**
 * Created by DarwinRie on 16/1/26.
 */

module.exports.mysqlConfigure = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'distcenter'
};

module.exports.IPAInstallURLbase = "https://192.168.11.116:3001/ipa/";

// Only iMac
// xcrun pngcrush -revert-iphone-optimizations {src} {dst}
module.exports.uncrashIconCmd = 'python /Users/jinchudarwin/WebstormProjects/distcenter/exec/uncrushpng.py "{src}" "{dst}" ';
