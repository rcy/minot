var MinotMongoose = require('./minot-mongoose');

var Minot = function() {};

Minot.prototype.connect = function(options, callback) {
  switch (options.db) {

  case 'mongoose':
    var conn = new MinotMongoose();
    conn.connect(options, function() {
      callback(conn);
    });
    break;
    
  default:
    throw 'unsupported db'
  }
}

module.exports = exports = Minot;
