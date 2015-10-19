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
    downloads = 0,
    callServers = function (settingsObj) {
        callNum++;
        async.each(settingsObj.urls, function(obj, eachCallback) {
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
    };

if (settings.REPEAT) {
    setInterval(function() {
        console.log(moment().format() + " callNum=" + callNum + " hostname=" + hostname);
        callServers(settings);
    }, settings.INTERVAL_TIME);
} else {
    callServers(settings);
}

process.on('SIGINT', function() {
    console.log(moment().format(), {
       downloads : downloads,
        TotalCalls : callNum
    });

    process.exit();
});



