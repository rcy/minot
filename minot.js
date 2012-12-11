var r = require('rethinkdb');
var Minot = function() {};

Minot.prototype.connect = function(options, callback) {
  var self = this;
  if (options.db === 'rethinkdb') {
    var conn = new RTConn();
    conn.connect(options, function() {
      callback(conn);
    });
  } else {
    throw 'unsupported db'
  }
}

module.exports = exports = Minot;

var RTConn = function() {
  this.db = null;
};
  
RTConn.prototype.connect = function(options, callback) {
  var name = options.name || 'test';
  var self = this;
  r.connect({host:options.host, port:options.port}, function() {
    console.log('rethink connected')
    r.dbCreate(name).run(function(result) {
      console.log('created db', name, 'result:', result);
      var db = self.db = r.db(name);
      db.tableCreate('lists').run(function() {
        db.tableCreate('items').run(function() {
          console.log('created system tables');
          callback();
        });
      });                      
    });
  }, function() {
    throw 'rethinkdb connection failed';
  });
}

RTConn.prototype.clear = function(callback) {
  var db = this.db;
  db.tableDrop('lists').run(function() {
    db.tableDrop('items').run(function() {
      db.tableCreate('lists').run(function() {
        db.tableCreate('items').run(function() {
          callback();
        });
      });                      
    });
  });
}

RTConn.prototype.lists = function(callback) {
  this.db.table('lists').run().collect(callback);
}

RTConn.prototype.listGet = function(id, callback) {
  this.db.table('lists').get(id).run(callback);
}

RTConn.prototype.listCreate = function(doc, callback) {
  var db = this.db;
  var obj = {
    name: doc.name,
    fields: doc.fields || [],
    ownerID: doc.ownerID || 'anonymous'
  };

  if (!obj.name) throw "need a name"; // validate list properly

  validateListFields(obj.fields);

  db.table('lists').insert(obj).run(function(result) {
    db.table('lists').get(result.generated_keys[0]).run(callback);
  });
}

RTConn.prototype.listDestroy = function(id, callback) {
  this.db.table('lists').get(id).del().run(callback);
}

// from https://gist.github.com/1308368
var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}

function validateListFields(arr) {
  for (var i in arr) {
    if (!arr[i].id)
      arr[i].id = uuid();
  }
}

RTConn.prototype.listUpdate = function(id, doc, callback) {
  validateListFields(doc.fields);

  this.db.table('lists').get(id).update({fields: doc.fields}).run(callback);
}

// ----------------- ITEMS
RTConn.prototype.listItems = function(id, callback) {
  this.db.table('items').filter(r('listId').eq(id)).run().collect(callback);
}

RTConn.prototype.itemAdd = function(listId, doc, callback) {
  doc.listId = listId;
  var self = this
  this.db.table('items').insert(doc).run(function(result) {
    console.log('itemAdd: ', result);
    var id = result.generated_keys[0];
    self.itemGet(id, callback);
  });
}

RTConn.prototype.itemGet = function(id, callback) {
  this.db.table('items').get(id).run(callback);
}

RTConn.prototype.itemDestroy = function(id, callback) {
  this.db.table('items').get(id).del().run(callback);
}
