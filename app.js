var http = require('http')
  , clone = require('clone')
  , bl = require('bl')
  , cfg = require('./config')
  , customers = require('./config/customers.local')
  , utils = require('./utils');

console.log('Starting server');

var server;
if (cfg.protocol == 'http') {
    server = http.createServer(handler);
    console.log('Server configured for HTTP');
} else if (cfg.protocol == 'https') {
    // create the SSL options object
    var fs = require('fs');
    var options = {
        key: fs.readFileSync(cfg.ssl.key),
        cert: fs.readFileSync(cfg.ssl.cert),
        ca: fs.readFileSync(cfg.ssl.ca)
    };
    server = require('https').createServer(options, handler);
    console.log('Server configured for HTTPS');
} else {
    throw new Error('Unsupported protocol');
}
server.listen(cfg.port);
console.log('Server listening to port '+cfg.port);

function handler(req, res) {
    // get info from request
    var reqInfo = utils.http.getInfo(req);

    // check if the customer is on our list
    if (!customers.hasOwnProperty(reqInfo.customer)) {
        var error = 'Error: customer "'+customer+'" not found';
        console.log(error);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(error);
        return;
    }
    var customer = customers[reqInfo.customer];

    // do some logging
    console.log('Request for customer: '+reqInfo.customer);
    console.log('- Relaying request to: '+customer.host);

    // create the headers for our request
    var headers = clone(req.headers);
    // we put the hostname for the customer site in the headers, so the
    // webserver knows which site to serve
    headers.host = customer.hostname;
    headers = utils.http.cleanHeaders(headers);

    // create a new request for the customer site
    var options = {
        'host': customer.host,
        'port': customer.port,
        'path': '/',
        'method': req.method,
        'headers': headers
    };
    // check if the request has the get variable 'u'
    if (reqInfo.url.query.hasOwnProperty('u')) {
        var path = decodeURIComponent(reqInfo.url.query.u);
        // prefix a '/' if the path doesn't have one
        options.path = path[0] != '/' ? '/'+path : path;
    }

    // perform the request to the customer site
    var custReq = http.request(options, function(custRes) {
        // do some more logging for good measure
        console.log('- Response: '+custRes.statusCode);

        // the system can't handle 206s so we just pipe them through to the client
        if (custRes.statusCode == 206) {
            console.log('- Statuc code 206, returning to client');
            res.writeHead(custRes.statusCode, custRes.headers);
            custRes.pipe(res);
            console.log('Done');
            return;
        }

        // content other than html can be piped directly to the client's response
        if (typeof custRes.headers['content-type'] === 'undefined'
                || custRes.headers['content-type'] != 'text/html') {
            console.log('- Response '+custRes.headers['content-type']+', returning to client');
            res.writeHead(custRes.statusCode, custRes.headers);
            custRes.pipe(res);
            console.log('Done');
            return;
        }

        // the server now has a nice html response, so we start buffering it
        console.log('- Response HTML, buffering...');
        custRes.pipe(bl(function(err, data) {
            // some error handling
            if (err) {
                console.log('- Error: '+err.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Unable to buffer from remote');
                return;
            }

            // let's be a bit more verbose
            console.log('- Response buffered, '+data.length+' bytes received, starting rewrite');

            // create a html string from the buffered data and replace all urls
            utils.rewriter.rewriteHtml(data.toString(), reqInfo.customer, function(err, html) {
                // error handling
                if (err) {
                    console.log('- Error: '+err.message);
                    console.log(err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Unable to rewite html');
                    return;
                }

                // html is now rewritten, let's return it to the client
                console.log('- Response rewritten, sending to client');
                res.writeHead(custRes.statusCode, custRes.headers);
                res.end(html);
                console.log('Done');
            });
        }));
    });
    // some error handling
    custReq.on('error', function(e) {
        console.log('- Error: problem with request: '+e.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Unable to send a request to remote');
        console.log('Done');
    });
    // and end the request to the customer site
    custReq.end();
};