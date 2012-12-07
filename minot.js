var uuid = require('node-uuid');
var r = require('rethinkdb');
var db;

exports.connect = function(options) {
  options || (options = {});
  r.connect({host:options.host, port:options.port}, function() {
    console.log('rethink connected')
    var dbName = options.dbName || 'test';
    r.dbCreate(dbName).run(function(result) {
      console.log('created db', dbName, 'result:', result);
      db = r.db(dbName);
      db.tableCreate('lists').run(function() {
        db.tableCreate('items').run(function() {
          console.log('created system tables');
          options.callback && options.callback();
        });
      });                      
    });
  }, function() {
    throw 'rethinkdb connection failed';
  });
}

exports.lists = function(callback) {
  db.table('lists').run().collect(callback);
}

exports.listGet = function(id, callback) {
  db.table('lists').get(id).run(callback);
}

exports.listFetchByName = function(name, callback) {
  db.table('lists').filter(r('name').eq(name)).run(function(result) {
    callback(result);
  });
};  

exports.listCreate = function(options) {
  options || (options = {});
  var owner = options.owner || "anonymous";
  var fields = options.fields || [];
  var name = options.name;
  var callback = options.callback;

  if (!name) {
    throw "name required";
  }

  exports.listFetchByName(name, function(result) {
    if (result) {
      callback(result);
      return;
    }

    db.table('lists').insert({name: name, fields: fields, owner: owner}).run(function(result) {
      exports.listFetchByName(name, function(result) {
        callback(result);
      });
    });
  });
}

exports.listUpdate = function(id, doc, callback) {
  db.table('lists')
    .get(id)
    .update({fields: doc.fields})
    .run(callback);
}

exports.listDestroy = function(id, callback) {
  db.table('lists').get(id).del().run(callback);
}

exports.itemAdd = function(list, doc, callback) {
  doc.list = list; // TODO: make sure list exists, validate fields
  db.table('items').insert(doc).run(function(result) {
    console.log('itemAdd: ', result);
    var id = result.generated_keys[0];
    exports.itemGet(id, callback);
  });
}

exports.itemGet = function(id, callback) {
  db.table('items').get(id).run(callback);
}

exports.listItems = function(list, callback) {
  db.table('items').filter(r('list').eq(list)).run().collect(callback);
}

exports.lists = function(callback) {
  db.table('lists').run().collect(callback);
}
