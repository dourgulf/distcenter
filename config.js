/**
 * Created by DarwinRie on 16/1/26.
 */

module.exports.mysqlConfigure = {
    host: 'localhost',
    user: 'distcenter',
    password: 'distcenternopass',
    database: 'distcenter'
};

module.exports.IPAInstallURLbase = "https://www.dawenhing.top/ipa/";

// Only iMac
// xcrun pngcrush -revert-iphone-optimizations {src} {dst}
module.exports.uncrashIconCmd = 'python /home/ubuntu/node/distcenter/exec/uncrushpng.py "{src}" "{dst}" ';
