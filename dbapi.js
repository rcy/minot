var r = require('rethinkdb');
var uuid = require('node-uuid');
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

function uniqueTableName(basename) {
  return (basename+'_'+uuid.v4()).replace(/[^A-Za-z0-9]/g,'_')
}

exports.catalogCreate = function(options) {
  var cats = db.table('catalogs');

  var name = options.name;
  var fields = options.fields || [];
  var owner = options.owner || 'anonymous';

  cats.filter(r('name').eq(name)).count().run(function(result) {
    if (result > 0) {
      options.failure({error: 'catalog already exists', response: 500});
    } else {
      var tableName = uniqueTableName(name);
      console.log('trying to create table', tableName, '...');
      db.tableCreate(tableName).run(function(result) {
        console.log('trying to create table', tableName, '...result:', result);
        if (result) {
          result.response = 500;
          options.failure(result);
        } else {
          cats.insert({name: name, table: tableName, owner: owner, fields: fields}).run(function(result) {
            options.success({result: result, response: 201});
          });
        }
      });
    }
  });
}