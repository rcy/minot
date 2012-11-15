r = require('rethinkdb');

exports.formatParser = function() {
  return function(req, res, next) {
    var match = req.url.match(/^(\/api\/.+)\.(.+)$/);
    if (match) {
      req.url = match[1];
      req.format = match[2];
    } else {
      req.format = 'json';
    }
    next();
  }
}

exports.initialize = function(app) {
  // connect database
  r.connect({host:'localhost', port: 28015}, function() {
    console.log('rethink connected')
  }, function() {
    throw 'rethinkdb connection failed';
  });

  // setup api endpoints

  // ------
  // TABLES
  // ------
  app.get('/api/tables', function(req, res) {
    r.db('test').tableList().run().collect(function(tables) {
      res.send({'tables': tables});
    });
  });

  app.post('/api/tables', function(req, res) {
    var name = req.body.name;
    console.log('name', name);
    r.db('test').tableCreate(name).run(function(x) {
      res.send(x, 201);
    });
  });

  // ------
  // DOCUMENTS
  // ------
  app.get('/api/tables/:table/documents', function(req, res) {
    var table = req.params.table;
    var per_page = 100;
    r.db('test').table(table).limit(per_page).run().collect(function(documents) {
      res.send({table: table, documents: documents, page: 0, per_page: per_page, doc_count: '???'});
    });
  });

  app.post('/api/tables/:table/documents', function(req, res) {
    var table = req.params.table;
    var doc = req.body;
    r.db('test').table(table).insert(doc).run(function(result) {
      res.send(result);
    });
  });

  app.get('/api/tables/:table/documents/:id', function(req, res) {
    var table = req.params.table;
    var id = req.params.id;
    var doc = r.db('test').table(table).get(id).run(function(doc) {
      if (doc) {
        res.send(doc);
      } else {
        res.send({error: 'not found'}, 404);
      }
    });
  });

  // post a new document in :table
  app.post('/api/tables/:table', function(req, res) {
    var table = req.params.table;
    r.table(table).insert(req.body).runp();
    res.send('');
  });

}
