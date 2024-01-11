var express = require('express');
var router = express.Router();
const handelurlExpander = require('../src/controllers/expander');
router.get('/', function(req, res) {
  const urls = req.flash('urls');
  const error = req.flash('error');
  res.render('index',{urls,error});
});

router.post('/expand',handelurlExpander)

module.exports = router;
