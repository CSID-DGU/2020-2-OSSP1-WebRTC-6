var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');

var firebase = require('firebase');

require("firebase/auth");
 
/* GET home page. */
router.get('/', function(req,res,next){
  res.render('loginForm');
})

router.get('/creatForm', function(req,res,next){
    res.render("createForm");
})

router.post('/loginChk', function(req, res, next) {

    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
       .then(function(firebaseUser) {
           //res.redirect('boardList');
        //    res.set('Content-Type', 'text/html');
        //    res.sendFile(path.join(__dirname, "../onetomany/index.html"));
        res.render('index');
       })
      .catch(function(error) {
        switch(error.code){ 
            case "auth/invalid-email": 
                alert('유효하지 않은 메일입니다'); 
                break; 
            case "auth/user-disabled": 
                alert('사용이 정지된 유저 입니다.') 
                break; 
            case "auth/user-not-found": 
                alert('사용자를 찾을 수 없습니다.') 
                break; 
            case "auth/wrong-password": 
                alert("잘못된 패스워드 입니다."); 
                break; 
            }


        
          res.render('loginForm');
      });   
});

router.post('/createUser', function(req, res, next) {
    firebase.auth().createUserWithEmailAndPassword(req.body.id, req.body.passwd)
        .then(function(firebaseUser){
            res.render('loginForm');
        })
        .catch(function(error){
            switch(error.code){
                case "auth/email-already-in-use":
                    alert('이미 사용중인 이메일 입니다.');
                    break; 
                case "auth/invalid-email":
                    alert('유효하지 않은 메일입니다');
                    break; 
                case "auth/operation-not-allowed":
                    alert('이메일 가입이 중지되었습니다.') 
                    break; 
                case "auth/weak-password": 
                    alert("비밀번호를 6자리 이상 필요합니다"); 
                    break;
            }
            res.render('createForm');
        }) 
});
 
module.exports = router;

