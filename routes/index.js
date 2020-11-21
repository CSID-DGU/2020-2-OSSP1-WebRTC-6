var express = require('express');
var router = express.Router();
var path = require("path");

var firebase = require('firebase/app');

var firebaseConfig = {
    apiKey: "AIzaSyAM-8-3iuCf1P8O8fvrO0gLZ-bffdMf2JE",
    authDomain: "webrtc-110d1.firebaseapp.com",
    databaseURL: "https://webrtc-110d1.firebaseio.com",
    projectId: "webrtc-110d1",
    storageBucket: "webrtc-110d1.appspot.com",
    messagingSenderId: "621543592690",
    appId: "1:621543592690:web:76aca8f54baf63ecdcb66b",
    measurementId: "G-FFQ47LWF90"
};
firebase.initializeApp(firebaseConfig);

require("firebase/auth");
 
/* GET home page. */
router.get('/', function(req,res,next){
  //res.render('index', {title: 'Express'})
  //res.send('login page');
  res.render('loginForm');
})

router.post('/loginChk', function(req, res, next) {
    console.log("test2");
    console.log(req.body.id);

    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
       .then(function(firebaseUser) {
           //res.redirect('boardList');
           res.set('Content-Type', 'text/html');
           res.sendFile(path.join(__dirname, "../onetomany/index.html"));
       })
      .catch(function(error) {
          res.redirect('loginForm');
      });   
});

 
module.exports = router;

