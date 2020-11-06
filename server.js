const express= require('express');
const app= express();
const http= require('http');
const server= http.createServer(app);
const port= process.env.PORT || 8080;
const io= require('socket.io')(server);

let broadcaster;

//access public folder
app.use(express.static(__dirname+"/onetomany"));

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
server.listen(port,()=>{
    console.log(`Server opening at PORT : ${port}`);
})

