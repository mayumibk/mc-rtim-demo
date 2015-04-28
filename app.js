/*
 * ************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *   Copyright 2015 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ************************************************************************
 */

var express = require('express');
var path = require('path');
var multer = require('multer');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var anomalydetection = require('./routes/anomalydetection');
var datasources = require('./routes/datasources');
var democonsole = require('./routes/democonsole');
var aam = require('./routes/aam');
var aamapi = require('./routes/aam-api');
var view = require('./routes/view');
var rest = require('./routes/rest');
var amo = require('./routes/amo');
var amoContainer = require('./routes/amoContainer');
var audiences = require('./routes/audiences');
var audiencesapi = require('./routes/audiences-api.js');
var target = require('./routes/target.js');
var onsite = require('./routes/target-onsite.js');
var mac = require('./routes/mac.js');
var analytics = require('./routes/analytics.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(cookieParser());
/*
 Configure the multer module to handle file uploads.
 */
app.use(multer({ dest: './public/images/',
  rename: function (fieldname, filename) {
    return filename; // Override default behaviour of creating a unique name.
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done=true;
  }
}));

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { maxAge: 60000 }}))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/reports/anomalydetection', anomalydetection);
app.use('/mac/datasources', datasources);
app.use('/democonsole', democonsole);
app.use('/view', view);
app.use('/rest', rest);
app.use('/portal', aam);
app.use('/portal/api/v1',aamapi);
app.use('/display',amo);
app.use('/CMDashboard',amoContainer);
app.use('/audiences.html',audiences);
app.use('/audiencelibrary',audiencesapi);
app.use('/target',target);
app.use('/onsite',onsite);
app.use('/mac',mac);
app.use('/analytics',analytics);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next('/mac/feed.html');
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


var server = app.listen(1092, function () {

  var host = "localhost";
  var port = 1092;

  console.log('Adobe Marketing Cloud Core Services Demo Server listening at http://%s:%s', host, port);
  console.log('To get started, go to http://%s:%s/democonsole', host,port);

})

module.exports = app;
