var Minot = require('../minot/minot');
var assert = require('assert');

describe("Minot", function() {
  var minot = new Minot();
  var conn;

  before(function(done) {
    minot.connect({db: 'mongodb', url:'mongodb://localhost:27017/test'}, function(connection) {
      conn = connection;
      done();
    })
  });

  describe("api", function() {

    beforeEach(function(done) {
      conn.clear(done);
    });

    describe("lists", function() {
      it('fetch empty set of lists', function(done) {
        conn.lists(function(result) {
          assert.equal(result.length, 0);
          done();
        });
      });

      it('should create and fetch list', function(done) {
        conn.listCreate({name:"newlist"}, function() {
          conn.lists(function(result) {
            assert.equal(result.length, 1);
            done();
          });
        });
      });

    });

    describe("users", function() {
      var fred = {name: "Fred Flintstone", email: "fred@nomail.com", password: "abc"};
      it('should create a new user', function(done) {
        conn.userCreate(fred, 
                        function(err, result) {
                          assert.equal(result.name, fred.name)
                          done();
                        });
      });

      it('should not find nonexistent user', function(done) {
        conn.findUser({email: fred.email}, function(user) {
          assert.equal(user, null);
          done();
        });
      });

      it('should find a user by email', function(done) {
        conn.userCreate(fred, function(err, result) {
          conn.findUser({email: fred.email}, function(user) {
            assert.equal(user.name, "Fred Flintstone");
            done();
          });
        });
      });

      it('should find a user by id', function(done) {
        conn.userCreate(fred, function(err, result) {
          var id = result._id;
          conn.findUserById(id, function(user) {
            assert.equal(user.name, "Fred Flintstone");
            done();
          });
        });
      });

      it('should not create two users with the same email', function(done) {
        conn.userCreate(fred, function(err, result) {
          conn.userCreate(fred, function(err, result) {
            assert.equal(err.message, 'email already exists');
            done();
          });
        });
      });

      it('should authenticate user with password', function(done) {
        conn.userCreate(fred, function(err, user) {
          var result = conn.userPasswordAuth(user, fred.password);
          assert.equal(result, true);
          done();
        });
      });
      it('should not authenticate user with bad password', function(done) {
        conn.userCreate(fred, function(err, user) {
          var result = conn.userPasswordAuth(user, "bogusPass99");
          assert.equal(result, false);
          done();
        });
      });
    });
  });
});
