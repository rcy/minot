var Minot = require('../minot');
var assert = require('assert');

describe("Minot", function() {
  var minot = new Minot();
  var conn;

  before(function(done) {
    minot.connect({db: 'rethinkdb', name:'test'}, function(connection) {
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
  });
})
