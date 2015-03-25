var fn = module.exports = {}
  , url = require('url');

fn.getInfo = function(request) {
    var info = {};
    info.url = url.parse(request.url, true);
    var pathname = info.url.pathname[0] == '/' ? info.url.pathname.substr(1) : info.url.pathname;
    info.customer = pathname.split('/').shift();
    return info;
};

fn.cleanHeaders = function(headers) {
    var clean = {};
    var toKeep = [
        'host',
        'accept',
        'connection',
        'user-agent'
    ];
    toKeep.forEach(function(header) {
        if (headers.hasOwnProperty(header)) {
            clean[header] = headers[header];
        }
    });
    return clean;
};