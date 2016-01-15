/**
 * Created by Darwin Rie on 16/1/14.
 */

var express = require('express');
var router = express.Router();
var debug = require('debug')('distcenter:qrcode');

var qr = require('qr-image');

router.get('/create', function (req, res) {
    var text = req.query.text;
    var size = (req.query.size || 10) * 1;    // 强制转成数字

    debug("text:" + text);
    debug("size:" + size);
    try {
        var img = qr.image(text,{size :size, type: "png"});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (e) {
        res.writeHead(414, {'Content-Type': 'text/html'});
        res.end('<h1>414 Request-URI Too Large</h1>');
    }
});

module.exports = router;
