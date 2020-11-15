const express= require('express');
const app= express();
const http= require('http');
const https= require('https');
const path = require('path');
const fs = require('fs');
const { nextTick } = require('process');

const serverConfig = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };

const server= https.createServer(serverConfig, app);
const port= process.env.PORT || 8080;
const io= require('socket.io')(server);

let broadcaster;


//access public folder

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname, "/onetomany/login.html"));
  })
  
app.get('/index', function(req,res){
  
    res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, "/onetomany/index.html"));
    
})

// app.get('/style.css', function(req,res){
  
//       res.set('Content-Type', 'text/css');
//       res.sendFile(path.join(__dirname, "/onetomany/style.css"));
//   })
  
// app.use(function(req,res,next){
//     res.sendFile(path.join(__dirname, "/onetomany/login.html"));
//     next();
// });

app.use(express.static(__dirname+"/onetomany/"));

//For Public folder
//Check socket.io connection
io.sockets.on("error", e =>{console.log("SocketError",e)});
io.sockets.on("connection",socket=>{
    socket.on("broadcaster",()=>{
        broadcaster=socket.id;
        socket.broadcast.emit("broadcaster");
    });
    socket.on("watcher",()=>{
        socket.to(broadcaster).emit("watcher",socket.id);
    });
    socket.on("offer",(id,message)=>{
        socket.to(id).emit("offer",socket.id,message);
    });
    socket.on("answer",(id,message)=>{
        socket.to(id).emit("answer",socket.id,message);
    });
    socket.on("candidate",(id,message)=>{
        socket.to(id).emit("candidate",socket.id,message);
    })
    socket.on("disconnect",()=>{
        socket.to(broadcaster).emit("disconnetPeer",socket.id);
    });
})

// Listening port
server.listen(port,'0.0.0.0',()=>{
    console.log(`Server opening at PORT : ${port}`);
})

