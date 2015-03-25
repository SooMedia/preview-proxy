var config = module.exports = {};

config.host = 'preview.example.org';
config.port = 8080;
config.hostname = config.host+':'+config.port;
config.protocol = 'https';
config.url = config.protocol+'://'+config.hostname;
config.ssl = {
    key: '/location/of/the/ssl/keyfile.key',
    cert: '/location/of/the/ssl/certificate.crt',
    ca: '/location/of/the/ssl/ca-bundle.crt'
};
