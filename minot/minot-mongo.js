var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var BSON = mongo.BSONPure;

var MinotMongo = function() {
  this.db = null;
};
  
MinotMongo.prototype.connect = function(options, callback) {
  var self = this;
  MongoClient.connect("mongodb://localhost:27017/" + options.name, function(err, db) {
    if(!err) {
      console.log("mongodb: we are connected");
      self.db = db;
      callback();
    } else {
      throw err;
    }
  });
}

MinotMongo.prototype.clear = function(callback) {
  var db = this.db;
  db.dropCollection('lists', function(err, result) {
    db.dropCollection('items', function(err, result) {
      db.createCollection('lists', function(err, result) {
        if (err) throw err;
        db.createCollection('items', function(err, result) {
          if (err) throw err;
          callback();
        });
      });                      
    });
  });
}

MinotMongo.prototype.lists = function(callback) {
  this.db.collection('lists').find({}).toArray(function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

MinotMongo.prototype.oid = function(id) {
  return new BSON.ObjectID(id);
}

MinotMongo.prototype.listGet = function(id, callback) {
  this.db.collection('lists').findOne({_id: this.oid(id)}, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

MinotMongo.prototype.listCreate = function(doc, callback) {
  var obj = {
    name: doc.name,
    fields: doc.fields || [],
    ownerID: doc.ownerID || 'anonymous'
  };

  if (!obj.name) throw "need a name"; // validate list properly

  validateListFields(obj.fields);

  this.db.collection('lists').insert(obj, {w:1}, function(err, result) {
    if (err) throw err;
    callback(result[0]);
  });
}

MinotMongo.prototype.listDestroy = function(id, callback) {
  this.db.collection('lists').findAndRemove({_id: this.oid(id)}, [], {w:1}, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

// from https://gist.github.com/1308368
var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}

function validateListFields(arr) {
  for (var i in arr) {
    if (!arr[i].id)
      arr[i].id = uuid();
  }
}

MinotMongo.prototype.listUpdate = function(id, doc, callback) {
  delete doc._id;
  validateListFields(doc.fields);

  this.db.collection('lists').findAndModify({_id: this.oid(id)}, [], doc, {w:1, new:true}, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

// ----------------- ITEMS
MinotMongo.prototype.listItems = function(id, callback) {
  this.db.collection('items').find({listId: id}).toArray(function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

MinotMongo.prototype.itemAdd = function(listId, doc, callback) {
  doc.listId = listId;
  var self = this;
  this.db.collection('items').insert(doc, {w:1}, function(err, result) {
    if (err) throw err;
    console.log('itemAdd: ', result);
    callback(result[0]);
  });
}

// MinotMongo.prototype.itemGet = function(id, callback) {
//   this.db.table('items').get(id).run(callback);
// }

MinotMongo.prototype.itemDestroy = function(id, callback) {
  this.db.collection('items').findAndRemove({_id: this.oid(id)}, [], {w:1}, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

MinotMongo.prototype.itemUpdate = function(id, doc, callback) {
  delete doc._id;
  this.db.collection('items').findAndModify({_id: this.oid(id)}, [], doc, {w:1, new:true}, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

module.exports = exports = MinotMongo;
