# Client website previewer in Node.js

A simple tool which allows clients to preview the website you're building for them on the domain you don't own (or want to change the DNS records for).

## Why would I need it?

If you're making a WordPress website for your client, the file path and url will be stored into the database. When you want to deploy the website you would need to use a search and replace tool to change those settings. With this tool you can install WordPress on the client's domain and let them preview their site without them changing their host file.

## How does it work?

After you've installed the app on your server (for example for the preview.example.org subdomain) and configured the client's website in `./config/customers.local.js` the client will be able to view his website by browsing to `http://preview.example.org/customername`.

Following the client's request, the app will make it's own request to the client's website you're making. It will search for all URLs on the webpage (links, images, stylesheets, etc) and rewrite them to point to the app itself. This way everything works as it should. After this is done, the app will respond to the client's browser with the rewritten HTML.

## Installation

Just run `npm install` to install the dependencies.

## Running the app

To be able to run the app, make sure you put it somewhere you can use your browser to view it. After that you have to copy the `./config/config.local.js.dist` file to `./config/config.local.js` and the `./config/customers.local.js.dist` to `./config/customers.local.js`. When that's done you can change the files to suit your fancy.

### config.local.js:
```javascript
var config = require('./config.global');            // load the global config file

config.host = 'localhost';                          // this is the host of the app
config.port = 8080;                                 // this is the port of the app
config.hostname = config.host+':'+config.port;      // you could make this static
config.protocol = 'http';                           // change this to https if you're using SSL
config.url = config.protocol+'://'+config.hostname; // this is the URL that will be prefixed to the URLs on the client's site
config.ssl = {                                      // the SSL settings are only used if the protocol is https
    key: '/location/of/the/ssl/keyfile.key',        // the location of your SSL keyfile
    cert: '/location/of/the/ssl/certificate.crt',   // the location of your SSL certificate file
    ca: '/location/of/the/ssl/ca-bundle.crt'        // the location of your SSL ca-bundle file
};

module.exports = config;                            // export to node.js
```

### customers.local.js:
```javascript
module.exports = {
    'customer': {                 // define a new object for each customer and use URL safe characters for the name
        'host': '1.1.1.1',        // the host of the client's website
        'port': 80,               // the port of the client's website
        'hostname': 'example.org' // the domain the client's website will eventually run on
    }
};
```
Note: make sure you fill in the correct hostname, so the webserver knows which site to serve.

## Dependencies

The app has the following dependencies:

 - [Node.js v0.12.0](http://nodejs.org/) (it hasn't been tested on lower versions);
 - [http](http://nodejs.org/api/http.html);
 - [url](http://nodejs.org/api/url.html);
 - [bl](https://www.npmjs.com/package/bl);
 - [clone](https://www.npmjs.com/package/clone);
 - [cheerio](https://www.npmjs.com/package/cheerio).

All the dependencies are included in the repository.

## Todo

There's still a number of things that have to be added to this app:

 - Request body data support (for POST/PUT requests);
 - An index page for the app;
 - Add testing;
 - Make `app.js` a bit more structured;
 - Make the app run as CLI application for one customer site.