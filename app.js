var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var Minot = require('./minot/minot');
var minot = null;
(new Minot).connect({db: 'mongodb', name:'development'}, function(connection) {
  minot = connection;
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// api routes
app.get('/api/lists', function(req, res) {
  minot.lists(function(lists) {
    res.send({'lists': lists});
  });
});

app.get('/api/lists/:id', function(req, res) {
  minot.listGet(req.params.id, function(list) {
    if (list)
      res.send(list);
    else
      res.send(404);
  })
});

app.post('/api/lists', function(req, res) {
  minot.listCreate({ name: req.body.name,
                     fields: req.body.fields },
                   function(result) {
                     res.send(result, 201); // NOTE: this might already exist
                   });
});

app.del('/api/lists/:id', function(req, res) {
  minot.listDestroy(req.params.id,
                    function(result) {
                      res.send(204);
                    });
});

app.put('/api/lists/:id', function(req, res) {
  minot.listUpdate(req.params.id,
                   req.body,
                   function(result) {
                     res.send(result, 200);
                   });
});

app.get('/api/lists/:id/items', function(req, res) {
  minot.listItems(req.params.id, function(items) {
    res.send({'items': items});
  })
});

app.post('/api/lists/:id/items', function(req, res) {
  minot.itemAdd(req.params.id, req.body, function(result) {
    res.send(result);
  });
});

app.del('/api/lists/:lid/items/:id', function(req, res) {
  minot.itemDestroy(req.params.id, 
                    function(result) {
                      res.send(204);
                    });
});

app.put('/api/lists/:lid/items/:id', function(req, res) {
  minot.itemUpdate(req.params.id,
                   req.body,    // TODO: validate this
                   function(result) {
                     res.send(result, 200);
                   });
});

app.del('/api/lists/:id', function(req, res) {
  minot.itemDestroy(req.params.id,
                    function(result) {
                      res.send(204);
                    });
});

// start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
