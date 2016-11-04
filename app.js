var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var PDFDocument = require('pdfkit');
var index = require('./routes/index');
var users = require('./routes/users');
var http = require('http');
var app = express();
var request = require('request');
var rp = require('request-promise-native');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.post('/book',function(req,res) {
  const { pageWidthMm, pageHeightMm } = req.body.pageSize;
  const pageWidthPoints = 2.83465 * pageWidthMm;
  const pageHeightPoints = 2.83465 * pageHeightMm;
    console.log("creating document"); // Show the HTML for the Google homepage.
  doc = new PDFDocument({autoFirstPage: false});

    let requests = req.body.urls.reduce((promiseChain,url) => {
      console.log("chaining promise for " +url);
        return promiseChain.then(() => new Promise((resolve) => { 
           console.log("resolving promise for " +url);
          rp({ url, encoding: null}).then(function(callbackBody){
            console.log("adding page to doc"); // Show the HTML for the Google homepage.
            doc.addPage({
              width: pageWidthPoints,
              height: pageHeightPoints
            });
            console.log("downloading url " + url); // Show the HTML for the Google homepage.
            doc.image(callbackBody,0,0,pageWidthPoints,pageHeightPoints);
            resolve();
        });
        }));
    }, Promise.resolve());
    requests.then(() => { 
       doc.end();
    doc.pipe(res); 
      res.setHeader('content-type','application/pdf');

      console.log('done')
    });


  

});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

module.exports = app;
