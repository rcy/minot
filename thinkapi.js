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
    r.db('test').tableCreate('catalogs').run();
  }, function() {
    throw 'rethinkdb connection failed';
  });

  // setup api endpoints

  // ------
  // CATALOGS
  // ------
  app.get('/api/catalogs', function(req, res) {
    r.db('test').table('catalogs').run().collect(function(catalogs) {
      res.send({'catalogs': catalogs});
    });
  });

  app.post('/api/catalogs', function(req, res) {
    var cats = r.db('test').table('catalogs');
    var name = req.body.name;

    cats.filter(r('name').eq(name)).count().run(function(result) {
      if (result > 0) {
        res.send({error: 'catalog already exists'}, 500); // TODO: not 500
      } else {
        cats.insert({table_name: name, owner_name: 'rcy'}).run(function(result) {
          r.db('test').tableCreate(name).run(function(result) {
            res.send(result, 201);
          });
        });
      }
    });
  });

  // ------
  // ITEMS
  // ------
  app.get('/api/catalogs/:catalog/items', function(req, res) {
    var catalog = req.params.catalog;
    var per_page = 100;
    r.db('test').table(catalog).limit(per_page).run().collect(function(items) {
      res.send({catalog: catalog, items: items, page: 0, per_page: per_page, item_count: '???'});
    });
  });

  app.post('/api/catalogs/:catalog/items', function(req, res) {
    var catalog = req.params.catalog;
    var item = req.body;
    r.db('test').table(catalog).insert(item).run(function(result) {
      res.send(result);
    });
  });

  app.get('/api/catalogs/:catalog/items/:id', function(req, res) {
    var catalog = req.params.catalog;
    var id = req.params.id;
    var item = r.db('test').table(catalog).get(id).run(function(item) {
      if (item) {
        res.send(item);
      } else {
        res.send({error: 'not found'}, 404);
      }
    });
  });

  // post a new item in :catalog
  app.post('/api/catalogs/:catalog', function(req, res) {
    var catalog = req.params.catalog;
    r.table(catalog).insert(req.body).runp();
    res.send('');
  });

}
