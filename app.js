var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var Minot = require('./minot/minot');
var minot = null;
var mongo_url = process.env['MONGOHQ_URL'] || 'mongodb://localhost:27017/development';
(new Minot).connect({db: 'mongoose', url:mongo_url}, function(connection) {
  minot = connection;
});

passport.use(new LocalStrategy( 
  { 
    usernameField: 'email',
    passwordField: 'password' 
  },
  function(email, password, done) {
    minot.userLogin({email: email}, password, function(err, user){
      if (err) return done(err);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, {message: 'Authentication failed'});
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  minot.userGet(id, function(err, user) {
    if (err) done(err);
    done(null, user);
  });
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('abcdefghi'));
  app.use(express.session({secret: 'jklmnop'}));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/dummy', function(req,res) {
  res.send({'session': req.session,
            'user': req.user });
});

app.get('/signup', function(req, res) {
  var errors = req.session.errors || {};
  var input = req.session.input || {};
  res.render('signup', { title: 'Minot Signup', errors: errors, input: input });
  req.session.errors = {};
  req.session.input = {};
});
app.post('/signup', function(req, res) {
  minot.userCreate(req.body, function(err, user) {
    if (err) {
      res.redirect('/signup');
    } else {
      req.login(user, function(err) {
        if (err) return res.send(err, 500);
        return res.redirect('/');
      });
    }
  });
});
app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/');
});

app.get('/login', function(req, res) {
  res.render('login', {title: 'Minot Login', message: req.flash('error')});
});
app.post('/login',
         passport.authenticate('local', { successRedirect: '/',
                                          failureRedirect: '/login',
                                          failureFlash: true })
);
  
// api routes
app.get('/api/lists', function(req, res) {
  var ownerId = req.user && req.user._id;
  minot.lists(ownerId, function(err, lists) {
    if (err) return res.send(err, 500);
    res.send({'lists': lists});
  });
});

app.get('/api/lists/:id', function(req, res) {
  minot.listGet(req.params.id, function(err, list) {
    if (err) return res.send(err, 404);

    if (list)
      return res.send(list);
    else
      return res.send(null, 404);
  });
});

app.post('/api/lists', function(req, res) {
  var ownerId = req.user && req.user._id;

  minot.listCreate({ ownerId: ownerId },
                   function(err, result) {
                     if (err) return res.send(err, 500);
                     res.send(result, 201);
                   });
});

app.del('/api/lists/:id', function(req, res) {
  minot.listDestroy(req.params.id,
                    function(err, result) {
                      if (err) return res.send(err, 500);
                      res.send(204);
                    });
});

app.put('/api/lists/:id', function(req, res) {
  minot.listUpdate(req.params.id, req.body, function(err, result){
    if (err) return res.send(err, 500);
    minot.listGet(req.params.id, function(err, result){
      if (err) return res.send(err, 500);
      res.send(result, 200);
    });
  });
});

app.get('/api/lists/:id/items', function(req, res) {
  minot.items({listId: req.params.id}, function(err, items) {
    if (err) return res.send(err, 500);
    res.send({'items': items});
  })
});

app.post('/api/lists/:id/items', function(req, res) {
  minot.itemCreate(req.body, function(err, result) {
    if (err) return res.send(err, 500);
    res.send(result, 201);
  });
});

app.del('/api/lists/:lid/items/:id', function(req, res) {
  minot.itemDestroy(req.params.id, function(err, result) {
    if (err) return res.send(err, 500);
    res.send(204);
  });
});

app.put('/api/lists/:lid/items/:id', function(req, res) {
  minot.itemUpdate(req.params.id, req.body, function(err, result) {
    if (err) return res.send(err, 500);
    res.send({}, 200);
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
