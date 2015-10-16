var request = require('request'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    package = require('./package.json'),
    testDownloader = require('./lib/testDownloader.js'),
    settings = require('./lib/settings.js'),
    process = require('process'),
    hostname = require('os').hostname(),
    callNum = 0,
    downloads = 0;

setInterval(function() {
    callNum++;
    console.log(moment().format() + " callNum=" + callNum + " hostname=" + hostname);
    async.each(settings.urls, function(obj, eachCallback) {
        try {
            testDownloader.getBrowserBehaviour(obj.url, callNum, function(err, stats) {
                if (err) {
                    console.log(moment().format() + " Error:", err);
                }
                downloads++;
                eachCallback();
            });
        } catch (err) {
            if (err) {
                console.log(moment().format() + " Error:", err);
            }
            eachCallback();
        }
    });
}, settings.INTERVAL_TIME);

process.on('SIGINT', function() {
    console.log(moment().format(), {
       downloads : downloads,
        TotalCalls : callNum
    });

    process.exit();
});



