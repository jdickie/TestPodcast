var request = require('request'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    package = require('./package.json'),
    testDownloader = require('./lib/testDownloader.js'),
    settings = require('./lib/settings.js'),
    process = require('process'),
    callNum = 0,
    downloads = 0;

setInterval(function() {
    callNum++;
    console.log(moment().format() + " ");
    async.each(settings.urls, function(url, eachCallback) {
        try {
            if (settings.PODTRAC_ON) {
                url = settings.PODTRAC + url.replace(/^http:\/\//, '');
            }
            testDownloader.getBrowserBehaviour((url + settings.PATH), callNum, function(err, stats) {
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
}, 4320);

process.on('SIGINT', function() {
    console.log(moment().format(), {
       downloads : downloads,
        TotalCalls : callNum

    });
    
    process.exit();
});



