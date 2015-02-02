var express      = require('express')
  , path         = require('path')
  , favicon      = require('serve-favicon')
  , logger       = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser   = require('body-parser')
  , session      = require('express-session')
  , RedisStore   = require('connect-redis')(session)
  , common       = require('./common');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({client: common.redisSession})
, secret: common.config('session').secret
, resave: false
, saveUninitialized: false
}));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.path == '/login') {
    if (req.session.login) { return res.redirect('/'); }
    for (var k in common.config('logins')) {
      if (req.body.username === k && req.body.password === common.config('logins')[k]) {
        req.session.login = true;
        return res.redirect('/');
      }
    }
    return next();
  }

  if (!req.session.login) {
    return res.redirect('/login');
  } else {
    return next();
  }
});

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
