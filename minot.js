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

// exports.catalogs = function(callback) {
//   db.table('catalogs').run().collect(callback);
// }
exports.lists = function(callback) {
  db.table('lists').run().collect(callback);
}

function catalogTableName(name) {
  return (name).replace(/[^a-zA-Z0-9_]+/g, '');
}

// exports.catalogCreate = function(options) {
//   var cats = db.table('catalogs');

//   var name = options.name;
//   var owner = options.owner || 'anonymous';
//   var cb = options.callback;

//   cats.filter(r('name').eq(name)).count().run(function(result) {
//     if (result > 0) {
//       cb && cb({result: {error: "catalog '" + name + "' exists"}, response: 409});
//     } else {
//       cats.insert({name: name, owner: owner}).run(function(result) {
//         var id = result.generated_keys[0];
//         var tableName = catalogTableName(id);
//         db.tableCreate(catalogTableName(id)).run(function(result) {
//           console.log('create table', tableName, '...table_create_result:', result, '...done.');
//           if (result) {
//             throw result;
//           } else {
//             var cat = cats.get(id);
//               cat.update({tableName:tableName}).run(function(result) {
//               if (result.updated === 1) {
//                 cat.run(function(result) {
//                   cb && cb({result: result, response: 201});
//                 });
//               } else {
//                 console.log('update !== 1');
//                 throw result;
//               }
//             });
//           }
//         })
//       });
//     }
//   });
// }

exports.listFetch = function(name, callback) {
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

  exports.listFetch(name, function(result) {
    if (result) {
      callback(result);
      return;
    }

    db.table('lists').insert({name: name, fields: fields, owner: owner}).run(function(result) {
      exports.listFetch(name, function(result) {
        callback(result);
      });
    });
  });
}

exports.listDestroy = function(options, callback) {
  db.table('lists').get(options.id).del().run(callback);
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
