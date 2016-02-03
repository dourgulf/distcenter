/**
 * Created by Darwin Rie on 16/1/5.
 */
var IPAInfo = require('./ipa/appinfo');
var config = require('../config').mysqlConfigure

var debug = require('debug')('distcenter:dbservice');
var mysql = require('mysql');

function handleError (err) {
    if (err) {
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.warn('mysql connection closed, try reconnect');
            connect();
        } else {
            console.error(err.stack || err);
        }
    }
}

// 连接数据库
function connect () {
    debug('connecting mysql');
    db = mysql.createConnection(config);
    db.connect(handleError);
    db.on('error', handleError);

}

var db;

connect();

exports.saveAppInfo = function(appInfo, userID, fn) {
    var sql = "insert into ipa(app_id, storage_id, title, bundle_id, version, build_version, requireOSVersion, user_id, access_pwd, pwdsalt) values(?,?,?,?,?,?,?,?,?,?)";
    var params = [appInfo.appID, appInfo.storageID, appInfo.title, appInfo.bundleid, appInfo.version, appInfo.buildVersion, appInfo.requireOSVersion, userID, "", ""];
    debug("saving:" + params);

    var query = db.query(sql, params, function (err) {
        if (err) {
            console.log('save error:' + err);
        }
        fn(err);
    });
    debug("query sql:" + query.sql)
};

exports.queryAppInfo = function (appID, userID, fn) {
    var sql = "select app_id, storage_id, title, bundle_id, version, build_version, requireOSVersion, user_id, access_pwd, pwdsalt from ipa where app_id=? and user_id=?";
    var query = db.query(sql, [appID, userID], function(err, rows){
        if (err) {
            console.log("query error:" + err);
            fn(err);
            return ;
        }
        if (rows.length > 0) {
            var row0 = rows[0];
            var ipaInfo = new IPAInfo();
            ipaInfo.appID = row0.ipa_id;
            ipaInfo.userID = row0.user_id;
            ipaInfo.storageID = row0.storage_id;
            ipaInfo.title = row0.title;
            ipaInfo.bundleid = row0.bundleid;
            ipaInfo.version = row0.version;
            ipaInfo.buildVersion = row0.build_version;
            ipaInfo.requireOSVersion = row0.requireOSVersion;
            fn(null, ipaInfo);
        }
        else {
            fn(new Error("账号未注册"));
        }
    });
    debug("query sql:" + query.sql)
}
