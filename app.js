var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var sequelize = require('./models').sequelize;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// IIFE to connect to database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// sync model with database
sequelize.sync();

// Error handler to handle page not found issues
app.use(function(req, res, next) {
  console.log('404 handler fired');
  const error  = new Error()
  error.message = 'Oops! Page Not Found'
  error.status = 404
  res.render('page-not-found', {error})
  next(error);
});

// Global error handler for all other errors
app.use(function(err, req, res, next){
  console.log('global handler fired.');
  res.locals.error = err
  if (!err.status) {
    err.status = 500
    err.message = 'Server Error'

    console.log('server error')
    console.log(err.status, err.message)

    res.render('page-not-found', {error: err})
  }else{
    res.status(err.status || 500)
    res.render('page-not-found', {error: err})
  }
})

module.exports = app;
