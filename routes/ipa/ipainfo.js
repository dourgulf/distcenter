/**
 * Created by Darwin Rie on 16/1/13.
 */
var uuid = require('node-uuid');

function IPAInfo() {
    this.basePath;
    this.fileName;
    this.ipaID = uuid.v1();
    this.title = '';
    this.bundleid = '';
    this.version = '';
    this.buildVersion = '';
    this.title = '';
    this.requireiOS = '';
    //
    this.iconURL = '';
};

module.exports = IPAInfo;