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
(new Minot).connect({db: 'mongodb', url:mongo_url}, function(connection) {
  minot = connection;
});

passport.use(new LocalStrategy( 
  { 
    usernameField: 'email',
    passwordField: 'password' 
  },
  function(email, password, done) {
    console.log('passport.use localstrategy');
    minot.findUser({email: email}, function(user) {
      console.log('passport: findUser', user);
      // if (err) return done(err);
      if (!user) {
        return done(null, false, {message: 'No such user'});
      }
      if (!minot.userPasswordAuth(user, password)) {
        return done(null, false, {message: 'Incorrect password'});
      }
      return done(null, user);
    })}
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  minot.findUserById(id, function(user) {
    console.log(user);
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
  console.log(req.session);
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
      res.redirect('/');
    }
  });
});
app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/dummy');
});

app.get('/login', function(req, res) {
  res.render('login', {title: 'Minot Login', message: req.flash('error')});
});
app.post('/login',
         passport.authenticate('local', { successRedirect: '/dummy',
                                          failureRedirect: '/login',
                                          failureFlash: true })
);
  
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
