let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let expressValidator = require('express-validator');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let bodyParser = require('body-parser');
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');
let multer = require('multer');
let flash = require('connect-flash');

let routes = require('./routes/index');
let posts = require('./routes/posts');
let categories = require('./routes/categories');

let app = express();

// Global variable
app.locals.moment = require('moment');

app.locals.truncateText = function (text, length) {
    let truncate = text.substring(0, length);
    return truncate + " ...";
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Handle file uploads
//app.use(multer({dest: './public/images/uploads'}));
//Handle file uploads
app.use(multer({dest: './public/images/uploads'}).single('mainimage'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Handle Express Sessions
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        let namespace = param.split('.'), root = namespace.shift(), formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Connect-Flash
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Makes our db accessible to our router
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/posts', posts);
app.use('/categories', categories);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;