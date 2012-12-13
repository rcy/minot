var MinotRT = require('./minot-rethink');
var MinotMongo = require('./minot-mongo');

var Minot = function() {};

Minot.prototype.connect = function(options, callback) {
  switch (options.db) {

  case 'rethinkdb':
    var conn = new MinotRT();
    conn.connect(options, function() {
      callback(conn);
    });
    break;

  case 'mongodb':
    var conn = new MinotMongo();
    conn.connect(options, function() {
      callback(conn);
    });
    break;
    
  default:
    throw 'unsupported db'
  }
}

module.exports = exports = Minot;
