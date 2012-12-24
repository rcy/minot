var Minot = require('../minot/minot');
var assert = require('assert');

describe("Minot", function() {
  var minot = new Minot();
  var fred = {name: "Fred Flintstone", email: "fred@nomail.com", password: "abc"};
  var conn;

  before(function(done) {
    minot.connect({db: 'mongoose', url:'mongodb://localhost:27017/test'}, function(connection) {
      conn = connection;
      done();
    })
  });

  beforeEach(function(done) { conn.clear(done); });

  describe("lists", function(){
    describe("create", function(){
      it('should create a new list', function(done){
        conn.listCreate({name:"mylist", ownerId: null, fields: [{name:'f1', type:'string'}]}, function(err, list){
          assert.equal(list.name, "mylist");
          done();
        });
      });

      it('should create a list with defaults if nothing supplied', function(done){
        conn.listCreate({}, function(err, list){
          assert.equal(list.name, 'new untitled list');
          assert.equal(list.ownerId, null);
          assert.equal(list.fields.length, 1);
          assert.equal(list.fields[0].name, 'summary');
          assert.equal(list.fields[0].type, 'string');
          done();
        });
      });
      it('should trim list name', function(done){
        conn.listCreate({name:'  the name  '}, function(err, list){
          assert.equal(err, null);
          assert.equal(list.name, 'the name');
          done();
        });
      });
      it('should fail to create list with empty name string', function(done){
        conn.listCreate({name:'   '}, function(err, list){
          assert.equal(err.errors.name.type, 'required');
          done();
        });
      });        
      it('should fail to create list with empty fields array', function(done){
        conn.listCreate({fields:[]}, function(err, list){
          assert.equal(err.errors.fields.type, 'required');
          done();
        });
      });

      it('should fetch lists by ownerId', function(done){
        conn.userCreate(fred, function(err, user){
          conn.listCreate({ownerId: user._id}, function(err, list){
            conn.lists(user._id, function(err, lists){
              assert.equal(err, null);
              assert.equal(lists.length, 1);
              done();
            });
          });
        });
      });

      it('should rename list', function(done){
        conn.listCreate({name:'original', ownerId: null}, function(err, result){
          var list = result;
          conn.listUpdate(list.id, {name: 'new name'}, function(err, result){
            assert.equal(err, null);
            assert.equal(result, 1); // one doc updated
            conn.listGet(list.id, function(err, result){
              assert.equal(result.name, 'new name');
              done();
            });
          });
        });
      });
      it('should delete/archive list', function(done){
        conn.listCreate({}, function(err, result){
          var listId = result.id;
          conn.listDestroy(listId, function(err, result){
            assert.equal(err, null);
            conn.listGet(listId, function(err, result){
              assert.equal(err, null);
              assert.equal(result, null);
              done();
            });
          });
        });
      });
      it('should rename a field');
      it('should delete a field');
    });
  });

  describe('users', function(){
    it('should create a new user', function(done){
      conn.userCreate(fred, function(err, user) {
        assert.equal(err, null);
        assert.equal(user.name, fred.name);
        assert.equal(user.gravatar_hash.length, 32);
        assert.notEqual(user.password, fred.password);
        done();
      });
    });

    it('should fetch a user by id and not include password field', function(done){
      conn.userCreate(fred, function(err, result){
        conn.userGet(result._id, function(err, result){
          assert.equal(err, null);
          assert.equal(result.name, fred.name);
          assert.equal(result.email, fred.email);
          assert.equal(result.password, undefined);
          done();
        });
      });
    });

    it('should find a user by email', function(done){
      conn.userCreate(fred, function(err, result){
        conn.userFind({email: fred.email}, function(err, result){
          assert.equal(err, null);
          assert.equal(result.name, fred.name);
          done();
        });
      });
    });

    it('should return user if can find user and password matches', function(done){
      conn.userCreate(fred, function(err, user){
        conn.userLogin({email: fred.email}, 'abc', function(err, user){
          assert.equal(err, null);
          assert.equal(user.email, fred.email);
          done();
        });
      });
    });

    it('should not return user if can find user and password does not match', function(done){
      conn.userCreate(fred, function(err, user){
        conn.userLogin({email: fred.email}, 'badpass', function(err, user){
          assert.equal(err, null);
          assert.equal(user, null);
          done();
        });
      });
    });
    it('should not return user if cannot find user', function(done){
      conn.userLogin({email: 'bogusemail'}, 'anypass', function(err, user, message){
        assert.equal(err, null);
        assert.equal(user, null);
        done();
      });
    });

    it('should create a new list owned by user', function(done){
      conn.userCreate(fred, function(err, result){
        var user = result;
        conn.listCreate({ownerId: result.id}, function(err, result){
          assert.equal(err, null);
          assert.equal(result.ownerId, user.id);
          done();
        });
      });
    });

    it('should authenticate a user by password');
    it('should fail to create a second user with the same email');
    it('should delete a user and all lists and items owned by that user');
  });

  describe('items', function(){
    var list;
    beforeEach(function(done){
      conn.listCreate({fields: [{name:'town', type:'string'}]}, function(err, result){
        list = result;
        done();
      });
    });

    it('should return an empty set of items from a list', function(done){
      conn.items({listId: list.id}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.length, 0);
        done();
      });
    });

    it('should create a new item in a list', function(done){
      var f = list.fields[0];
      conn.itemCreate({listId: list.id, values: [ {fieldId: f.id, value: 'kaslo'} ]}, function(err, result){
        assert.equal(err, null);
        assert.equal(result.values[0].value, 'kaslo');
        done();
      });
    });

    it('should change values for an item in a list', function(done){
      var f = list.fields[0];
      conn.itemCreate({listId: list.id, values: [ {fieldId: f.id, value: 'kaslo'} ]}, function(err, result){
        var itemId = result.id;
        var values = result.values;
        values[0].value = 'nakusp';

        conn.itemUpdate(itemId, {values: values}, function(err, result){
          assert.equal(err, null);
          assert.equal(result, 1);

          conn.itemGet(itemId, function(err, result){
            assert.equal(result.values[0].value, 'nakusp');
            done();
          });
        });
      });
    });
    it('should fetch multiple items from a list');
    it('should remove an item from a list');
  });
});
