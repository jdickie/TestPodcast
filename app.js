var request = require('request'),
    async = require('async'),
    program = require('commander'),
    _ = require('underscore'),
    moment = require('moment'),
    package = require('./package.json'),
    testDownloader = require('./lib/testDownloader.js'),
    settings = require('./lib/settings.js');

setInterval(function() {
    async.each(settings.urls, function(url, eachCallback) {
        try {
            if (settings.PODTRAC_ON) {
                url = settings.PODTRAC + url.replace(/^http:\/\//, '');
            }
            testDownloader.getBrowserBehaviour((url + settings.PATH), function(err, stats) {
                if (err) {
                    console.log(moment().format() + " Error:", err);
                }
                eachCallback();
            });
        } catch (err) {
            if (err) {
                console.log(moment().format() + " Error:", err);
            }
            eachCallback();
        }
    });
}, 5000);



