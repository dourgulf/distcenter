/**
 * Created by Darwin Rie on 16/1/5.
 */
var IPAInfo = require('./ipa/ipainfo');
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

exports.saveIPAInfo = function(ipaInfo, userID, fn) {
    var sql = "insert into ipa(ipa_id, user_id) values(?,?)";
    db.query(sql, [ipaInfo.ipaID, userID], function (err) {
        fn(err);
    });
};

exports.queryIPAInfo = function (ipaID, userID, fn) {
    var sql = "select ipa_id, user_id from ipa where ipa_id=? and user_id=?";
    db.query(sql, [ipaID, userID], function(err, rows){
        if (err) {
            fn(err);
        }

        if (rows.length > 0) {
            var row0 = rows[0];
            var ipaInfo = new IPAInfo();
            ipaInfo.ipaID = row0.ipa_id;
            ipaInfo.userID = row0.user_id;
            fn(null, ipaInfo);
        }
        else {
            fn(new Error("账号未注册"));
        }
    });
}
