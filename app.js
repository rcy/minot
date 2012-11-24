var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , minot = require('./minot');

var app = express();

function apiFormatParser() {
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

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(apiFormatParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

minot.connect();

// api routes
app.get('/api/lists', function(req, res) {
  minot.lists(function(lists) {
    res.send({'lists': lists});
  });
});

app.post('/api/lists', function(req, res) {
  minot.listCreate({name: req.body.name,
                    fields: req.body.fields,
                    callback: function(result) {
                      res.send(result.result, result.response);
                    }});
});

app.get('/api/lists/:list/items', function(req, res) {
  minot.listItems(req.params.list, function(items) {
    res.send({'items': items});
  })
});

// start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
