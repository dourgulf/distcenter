/**
 * Created by DarwinRie on 16/1/26.
 */

var fs = require("fs");
var path = require("path")

var installPlistTemplate = fs.readFileSync(path.join(__dirname, '../views/plist-template.plist'), 'utf-8')

var installHTMLTemplate = fs.readFileSync(path.join(__dirname, '../views/install-template.html'), 'utf-8')

module.exports.installPlistTemplate = installPlistTemplate
module.exports.installHTMLTemplate = installHTMLTemplate