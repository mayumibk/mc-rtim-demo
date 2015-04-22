var demo = require('../libs/demo-controller.js');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('amo/display', { title: 'Express' });
});



module.exports = router;
