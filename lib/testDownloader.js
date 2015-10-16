var request = require('request'),
    async = require('async'),
    moment = require('moment'),
    _ = require('underscore'),
    hostname = require('os').hostname();
    TestDownloader = function() {};

TestDownloader.prototype.STATUS_SUCCESS = 200;
TestDownloader.prototype.STATUS_PARTIAL = 206;
TestDownloader.prototype.STATUS_MOVED = 301;
TestDownloader.prototype.STATUS_FORWARD = 302;
TestDownloader.prototype.STATUS_NOTFOUND = 404;
TestDownloader.prototype.STATUS_ERROR = 500;
TestDownloader.prototype.STATUS_UNAVAILABLE = 503;
TestDownloader.prototype.USER_AGENT = hostname + '_NPRLogTest';


TestDownloader.prototype.download = function (options, downloadCallback) {
    var self = this,
        status,
        byteLength = 0,
        contentLength,
        forwardUrl;
    console.log(moment().format() + " request: ", options);
    request(options, function(err, response, message) {
        if (response && response.statusCode) {
            status = response.statusCode;
            console.log(moment().format() + '  response ', response.headers);
            if (response.headers['content-length'] && response.headers['content-type'] == 'audio/mpeg') {
                contentLength = parseInt(response.headers['content-length'], 10);
            }
            if (response.headers['content-range']) {
                var bytes = response.headers['content-range'].replace(/^(.*?)\-/, '');
                bytes = bytes.replace(/\/[0-9]+$/, '');
                byteLength = parseInt(bytes, 10);
            }
            if (response.headers['location']) {
                forwardUrl = response.headers['location'];
            }
            console.log(moment().format() + " " + options.url + " " + status);
            downloadCallback(null, {
                status     : status,
                byteLength : byteLength,
                contentLength : contentLength,
                forwardUrl : forwardUrl
            });
        } else {
            if (err) {
                console.log(moment().format() + "  Error: " + err.message);
                downloadCallback(err, {
                    status : status,
                    byteLength:byteLength,
                    contentLength:contentLength,
                    forwardUrl:forwardUrl
                });
            }
        }
    });
};

TestDownloader.prototype.getBrowserBehaviour = function (url, callNum, getFileCallback) {
    var self = this,
        options = {
            url : url,
            timeout : 5000,
            method : 'GET',
            headers : {
                'User-Agent' : self.USER_AGENT + callNum,
                'Range' : 'bytes=0-'
            }
        },
        shouldFollow = function(err, stats) {
            if (err) {
                console.log(moment().format() + " closing connection due to error " + err.message);
                getFileCallback(err);
            } else {
                switch (stats.status) {
                    case self.STATUS_SUCCESS:
                        getFileCallback(null, stats);
                        break;
                    case self.STATUS_PARTIAL:
                    case self.STATUS_FORWARD:
                    case self.STATUS_MOVED:
                        var opts = options;
                        if (stats.contentLength <= stats.byteLength) {
                            // stop
                            console.log(moment().format() + " ", stats);
                            getFileCallback(null, stats);
                        } else {
                            if (stats.forwardUrl) {
                                opts.url = stats.forwardUrl;
                            }
                            opts.headers['Range'] = 'bytes=' + stats.byteLength + "-" + stats.contentLength;
                            console.log(moment().format() + " options: ", opts);
                            console.log(moment().format() + " stats: ", stats);
                            self.download(opts, shouldFollow);
                        }
                        break;
                    default:
                        console.log(moment().format() + " ", stats);
                        getFileCallback(null, stats);
                        break;
                }
            }
        };
    if (url.search(/\.llnwd\.net/) >= 0) {
        options.headers['Host'] = 'pd.npr.org';
    }
    self.download(options, shouldFollow);
};

exports = module.exports = new TestDownloader();