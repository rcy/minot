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
      db.tableCreate('catalogs').run(options.callback)
    });
  }, function() {
    throw 'rethinkdb connection failed';
  });
}

exports.catalogs = function(callback) {
  db.table('catalogs').run().collect(callback);
}

function catalogTableName(name) {
  return (name).replace(/[^a-zA-Z0-9_]+/g, '');
}

exports.catalogCreate = function(options) {
  var cats = db.table('catalogs');

  var name = options.name;
  var fields = options.fields || [];
  var owner = options.owner || 'anonymous';
  var cb = options.callback;

  cats.filter(r('name').eq(name)).count().run(function(result) {
    if (result > 0) {
      cb && cb({result: {error: "catalog '" + name + "' exists"}, response: 409});
    } else {
      cats.insert({name: name, owner: owner, fields: fields}).run(function(result) {
        var id = result.generated_keys[0];
        var tableName = catalogTableName(id);
        db.tableCreate(catalogTableName(id)).run(function(result) {
          console.log('create table', tableName, '...table_create_result:', result, '...done.');
          if (result) {
            throw result;
          } else {
            var cat = cats.get(id);
              cat.update({tableName:tableName}).run(function(result) {
              if (result.updated === 1) {
                cat.run(function(result) {
                  cb && cb({result: result, response: 201});
                });
              } else {
                throw result;
              }
            });
          }
        })
      });
    }
  });
}