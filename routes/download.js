/**
 * Created by DarwinRie on 16/1/14.
 */

var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:download');
var dbservice = require('./dbservice');

router.get('/query', function (req, res) {
    var ipaID = req.query.ipaID;
    var userID = req.query.userID;

});

module.exports = router;