var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var fieldSchema = mongoose.Schema({
  name: String,
  type: String
});

var listSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  name: { 
    type: String,
    trim: true,
    required: true,
    default: "new untitled list" },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: User, 
    default: null },
  fields: { 
    type: [fieldSchema], 
    required: true,
    default: [{name:'summary', type:'string'}]
  }
});

var valueSchema = mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Field
  },
  // the value can be anything based on the list field type, it is validated outside of mongoose
  value: { 
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

var itemSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  listId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: List, 
    required: true 
  },
  values: { 
    type: [valueSchema], 
    default: []
  }
});

var userSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  name: { type: String, trim: true },
  email: { type: String, required: true, trim: true, index: {unique: true} },
  gravatar_hash: { type: String },
  password: { type: String, required: true }
});

userSchema.pre('save', function(next){
  var SALT_WORK_FACTOR = 10;
  var user = this;

  if (!user.isModified('password')) return next();
  
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
    if (err) return next(err);
    
    bcrypt.hash(user.password, salt, function(err, hash){
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.pre('save', function(next){
  if (!this.isModified('email')) return next();

  this.email = this.email.toLowerCase();
  this.gravatar_hash = crypto.createHash('md5').update(this.email).digest("hex");

  next();
});

var Field = mongoose.model('Field', fieldSchema);
var Value = mongoose.model('Value', valueSchema);
var List = mongoose.model('List', listSchema);
var Item = mongoose.model('Item', itemSchema);
var User = mongoose.model('User', userSchema);

var MinotMongoose = function() {
}

MinotMongoose.prototype.connect = function(options, callback) {
  mongoose.connect(options.url, function(err) {
    callback(err);
  });
}

MinotMongoose.prototype.clear = function(callback){
  Field.remove({}, function(err){
    if (err) return callback(err);
    Value.remove({}, function(err){
      if (err) return callback(err);
      List.remove({}, function(err){
        if (err) return callback(err);
        Item.remove({}, function(err){
          if (err) return callback(err);
          User.remove({}, function(err){
            callback(err);
          });
        });
      });
    });
  });
}

MinotMongoose.prototype.userCreate = function(doc, callback){
  var user = new User(doc);
  user.save(function(err){
    callback(err, user);
  });
}

MinotMongoose.prototype.userFind = function(q, callback){
  User.findOne(q, {password:0}, callback);
}
MinotMongoose.prototype.userGet = function(id, callback){
  this.userFind({_id: id}, callback);
}
// return user in callback result if user can be found and password matches
MinotMongoose.prototype.userLogin = function(q, cleartext, callback) {
  User.findOne(q, function(err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    bcrypt.compare(cleartext, user.password, function(err, success){
      if (err) return callback(err);
      if (success)
        callback(null, user);
      else
        callback(null, null);
    })
  });
}

MinotMongoose.prototype.listCreate = function(doc, callback){
  var list = new List(doc);
  list.save(function(err){
    callback(err, list);
  });
}

MinotMongoose.prototype.listGet = function(id, callback){
  List.findOne({_id: id}, callback);
}

MinotMongoose.prototype.listUpdate = function(id, set, callback){
  delete set._id;
  delete set.ownerId;
  delete set.created;
  set.updated = Date.now();

  List.update({_id: id}, set, {}, callback);
}

MinotMongoose.prototype.lists = function(ownerId, callback){
  List.find({ownerId:ownerId}, callback);
}

MinotMongoose.prototype.listDestroy = function(id, callback){
  List.remove({_id: id}, callback);    
}

MinotMongoose.prototype.itemCreate = function(doc, callback){
  var item = new Item(doc);
  item.save(function(err){
    callback(err, item);
  });
}

MinotMongoose.prototype.items = function(q, callback){
  Item.find(q, callback);
}

MinotMongoose.prototype.itemUpdate = function(id, set, callback){
  delete set._id;
  delete set.created;
  set.updated = Date.now();

  Item.update({_id: id}, set, {}, callback);
}

MinotMongoose.prototype.itemGet = function(id, callback){
  Item.findOne({_id: id}, callback);
}


module.exports = exports = MinotMongoose;
