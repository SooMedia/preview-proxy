try {
    var cfg = require('./config.local');
} catch (e) {
    console.log('Error: '+e.message);
    var cfg = require('./config.global');
}
module.exports = cfg;
