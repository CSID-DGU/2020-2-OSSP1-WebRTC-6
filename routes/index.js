var express = require('express');
var router = express.Router();
var path = require("path");
var alert = require('alert');


var firebase = require('firebase');
const { fstat } = require('fs');
//const { firestore } = require('firebase-admin');


require("firebase/auth");
//require("@google-cloud/firestore")
require("firebase/database");
require("firebase/firestore");

const db = firebase.firestore();

/* GET home page. */
router.get('/', function(req,res,next){
  res.render('loginForm');
})

router.get('/creatForm', function(req,res,next){
    res.render("createForm");
})

const signEmail = () => {
    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
    .then(function(firebaseUser) {
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
   firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
   .then(signEmail.bind(this))
}

router.post('/loginChk', function(req, res, next) {

    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
       .then(function(firebaseUser) {
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
    //   firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    //     .then(function() {
    //         // Existing and future Auth states are now persisted in the current
    //         // session only. Closing the window would clear any existing state even
    //         // if a user forgets to sign out.
    //         // ...
    //         // New sign-in will be persisted with session persistence.
    //         return firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd);
    //     })
    //     .catch(function(error) {
    //         // Handle Errors here.
    //         var errorCode = error.code;
    //         var errorMessage = error.message;
    //         res.render('loginForm');
    //     });
});

router.post('/createUser', function(req, res, next) {
    firebase.auth().createUserWithEmailAndPassword(req.body.id, req.body.passwd)
        .then(userCredential => {
            const currentUser = {
                id : userCredential.user.uid,
                email: req.body.id,
                name: req.body.name,
                job: req.body.job
            }

            //DB유저 정보 저장
            db.collection('users').doc(currentUser.id).set({
                name: currentUser.name,
                email: currentUser.email,
                job: currentUser.job
            }).then(function(){
                console.log('fbDB에 유저정보 추가 성공');
            }).catch(function(error){
                console.log(error.code);
            })
            alert("회원가입성공");
            res.render('loginForm');
        })
        // .then(function(firebaseUser){
            
        //     alert("회원가입성공");
        //     res.render('loginForm');
        // })
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

