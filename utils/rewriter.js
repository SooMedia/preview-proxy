var fn = module.exports = {}
  , cheerio = require('cheerio')
  , cfg = require('../config');

fn.hasToRewrite = function(value) {
    if (value[0] == '#') {
        return false;
    }
    if (/^(f|ht)tps?:\/\//i.test(value)) {
        return false;
    }
    if (value.substr(0,7) == 'mailto:') {
        return false;
    }
    return true;
};

fn.rewriteUrl = function(prefix, url, encode) {
    encode = typeof encode !== 'undefined' ? encode : true;
    if (encode) {
        url = encodeURIComponent(url);
    }
    return prefix+url;
};

fn.getDoctype = function(html) {
    var pattern = /\<\!doctype\s+(([^\s\>]+)\s+)?(([^\s\>]+)\s*)?(\"([^\/]+)\/\/([^\/]+)\/\/([^\s]+)\s([^\/]+)\/\/([^\"]+)\")?(\s*\"([^\"]+)\")?\>/i;
    var re = new RegExp(pattern);
    var matches = re.exec(html);
    if (matches == null) {
        return '';
    }
    return matches[0];
}

fn.rewriteHtml = function(html, customer, callback) {
    var prefix = cfg.url+'/'+customer+'?u=';
    
    $ = cheerio.load(html);

    // find all elements with hrefs
    $('[href]').each(function(i, elem) {
        var href = $(this).attr('href');
        if (fn.hasToRewrite(href)) {
            $(this).attr('href', fn.rewriteUrl(prefix, href));
        }
    });
    $('[src]').each(function(i, elem) {
        var src = $(this).attr('src');
        if (fn.hasToRewrite(src)) {
            $(this).attr('src', fn.rewriteUrl(prefix, src));    
        }
    });

    callback(null, fn.getDoctype(html)+$.html());
};