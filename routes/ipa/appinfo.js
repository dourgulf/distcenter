/**
 * Created by Darwin Rie on 16/1/13.
 */
var uuid = require('node-uuid');

function AppInfo() {
    this.appID = uuid.v1();
    this.storageID;
    this.basePath;
    this.fileName;
    this.title = '';
    this.bundleid = '';
    this.version = '';
    this.buildVersion = '';
    this.title = '';
    this.requireOSVersion = '';
};

module.exports = AppInfo;