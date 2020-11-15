var tempStream;
var canvasStream = document.getElementById('canvas').captureStream(30);
var config = {
    openSocket: function(config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });
        
        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function(media) {
        var video = media.video;
        // video.setAttribute('controls', true);
        video.id="peer-video";

        participants.insertBefore(video, participants.firstChild);
        updateLayout();

        video.play();
        //rotateVideo(video);
    },
    onRoomFound: function(room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function() {
            tr = this;
            captureUserMedia(function() {
                broadcastUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function() {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.id="local-video";
    video.muted = "true"; //본인 마이크 음소거
    //video.setAttribute('controls', true); //재생버튼 및 재생시간
    //participants.insertBefore(video, participants.firstChild);
    localvideo.insertBefore(video, localvideo.firstChild); //insert video in localvideo tag 
    
    getUserMedia({
        video: video,
        onsuccess: function(stream) {
            tempStream = stream.getVideoTracks()[0];
            config.attachStream = stream;
            callback && callback();
            //rotateVideo(video); 한바뀌 도는 넘 
        },
        onerror: function() {
            alert('unable to get access to your webcam.');
            callback && callback();
        }
    });
}

/* on page load: get public rooms */
var broadcastUI = broadcast(config);

/* UI specific */
var localvideo = document.getElementById("localvideo") || document.body;
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    var non_visual = document.getElementsByClassName('non-visual');
    non_visual[0].style.display = 'block'; //hide peer connection page factor
}

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function() {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

function updateLayout() {
    // update CSS grid based on number of diplayed videos
    var rowHeight = '-webkit-fill-available';
    var colWidth = '-webkit-fill-available';

    var numVideos = document.getElementById("participants").childElementCount;
    console.log(numVideos);

    if (numVideos > 1 && numVideos <= 4) { // 2x2 grid
        rowHeight = '40vh';
        colWidth = '30vw';
    } else if (numVideos > 4) { // 3x3 grid
        rowHeight = '30vh';
        colWidth = '20vw';
    }

    document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
    document.documentElement.style.setProperty(`--colWidth`, colWidth);
}

(function() {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:right;font-size:12px"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();

function micOnOff(element) {
    if(config.attachStream.getAudioTracks()[0].enabled) {
      config.attachStream.getAudioTracks()[0].enabled = false
      document.getElementById("micIcon").classList.replace('fa-microphone', 'fa-microphone-slash');
    }
    else {
      config.attachStream.getAudioTracks()[0].enabled = true;
      document.getElementById("micIcon").classList.replace('fa-microphone-slash', 'fa-microphone');
    }
  }
  
  function cameraOnOff(element) {
    if(config.attachStream.getVideoTracks()[0].enabled) {
      config.attachStream.getVideoTracks()[0].enabled = false;
      document.getElementById("cameraIcon").classList.replace('fa-video', 'fa-video-slash');
    }
    else {
      config.attachStream.getVideoTracks()[0].enabled = true;
      document.getElementById("cameraIcon").classList.replace('fa-video-slash', 'fa-video');
    }
  }


//화이트보드 기능
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");
const erase = document.getElementById("jsErase");
const redpen = document.getElementById("redpen");
const reset = document.getElementById("reset");

canvas.width = 1100;
canvas.height = 800;
//canvas.width = 300;
//canvas.height = 200;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = "#2c2c2c";
ctx.lineWidth = 2.5;

let painting = false;
let filling = false;

stopPainting = () => {
  painting = false;
};

onMouseMove = e => {
  const x = e.offsetX;
  const y = e.offsetY;
  if (!painting) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};

startPainting = () => {
  painting = true;
};
handleCanvasClick = () => {
};
handleCM = e => {
  e.preventDefault();
};

if (canvas) {
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("contextmenu", handleCM);
}

handleRangeChange = e => {
  const brushWidth = e.target.value;
  ctx.lineWidth = brushWidth;
};

if (range) {
  range.addEventListener("input", handleRangeChange);
}

//Paint 클릭 시
handleModeClick = e => {
  painting = false;
  ctx.strokeStyle = "#2c2c2c";
  filling = false;
};
//Erase 클릭 시
handleEraseClick = e => {
  painting = false;
  ctx.strokeStyle = "white";
  filling = false;
};
//Redpen 클릭 시
handleRedPen = e => {
  painting = false;
  ctx.strokeStyle = "red";
  filling = false;
}
//Reset 클릭 시
handleReset = e => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

if (mode) {
  mode.addEventListener("click", handleModeClick);
}
if (erase) {
  erase.addEventListener("click", handleEraseClick);
}
if (redpen) {
  redpen.addEventListener("click", handleRedPen);
}
if (reset) {
  reset.addEventListener("click", handleReset);
}

function showWhiteBoard() {
  document.getElementById("whiteBoard").style.display = 'block';
  
  config.attachStream.removeTrack(config.attachStream.getVideoTracks()[0]);
  config.attachStream.addTrack(canvasStream.getVideoTracks()[0]);

  //arrPeers.forEach(function(element) { 
  //  peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
  //});
}

function hideWhiteBoard() {
  document.getElementById("whiteBoard").style.display = 'none';
  
  config.attachStream.removeTrack(config.attachStream.getVideoTracks()[0]);
  config.attachStream.addTrack(tempStream);
  
  //arrPeers.forEach(function(element) { 
  //  peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
  //});
}