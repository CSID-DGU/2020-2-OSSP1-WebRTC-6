var express = require('express');
var router = express.Router();

router.get('/index', function(req,res,next){
    res.send('index page');
    console.log("tesst success");
})

module.exports =  router;