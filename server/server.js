const HTTPS_PORT = 8443; //default port for https is 443
const HTTP_PORT = 8001; //default port for http is 80

const express = require('express');
const app = express();
//const router = express.Router();
const path = require("path");
const fs = require('fs');
const http = require('http');
const https = require('https');
//const url = requries('url');
const WebSocket = require('ws');
// based on examples at https://www.npmjs.com/package/ws 
const WebSocketServer = WebSocket.Server;

const hostname = '3.35.207.229';


app.get('/', function(req,res){
  res.sendFile(path.join(__dirname, "../client/login.html"));
})

app.get('/index', function(req,res){
    console.log('request received: ' + req.url);

    res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, "../client/index.html"));
  
})

app.get('/style.css', function(req,res){
  console.log('request received: ' + req.url);

    res.set('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, "../client/style.css"));

})

app.get('/webrtc.js', function(req,res){
  console.log('request received: ' + req.url);

    res.set('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, "../client/webrtc.js"));

})


// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function (request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

 if (request.url === '/webrtc.js') {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.end(fs.readFileSync('client/webrtc.js'));
  } else if (request.url === '/style.css') {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.end(fs.readFileSync('client/style.css'));
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(fs.readFileSync('client/index.html'));
  }
};


const httpsServer = http.createServer(serverConfig, app);
httpsServer.listen(HTTPS_PORT);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });

  ws.on('error', () => ws.terminate());
});

wss.broadcast = function (data) {
  this.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

console.log('Server running.'
);

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https
http.createServer(function (req, res) {
    console.log(req.headers['host']+req.url);
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(HTTP_PORT);