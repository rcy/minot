minot = require('./dbapi');


exports.initialize = function(app) {
  minot.connect();
  // setup api endpoints

  // ------
  // CATALOGS
  // ------
  app.get('/api/catalogs', function(req, res) {
    minot.catalogs(r, function(catalogs) {
      res.send({'catalogs': catalogs});
    });
  });

  app.post('/api/catalogs', function(req, res) {
    minot.catalogCreate(name: req.body.name);
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
