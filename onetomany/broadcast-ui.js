var tempStream;
var canvasStream = document.getElementById('canvas').captureStream(30);
var capacity = 1;

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
      $(".videos").append("<div class='video_content'></div>");
      video_content = document.getElementsByClassName("video_content");
      
      var index = video_content.length - 1;
      var id = "peer_video" + index.toString();
      
      video.setAttribute("class","peer_video");
      video.id = id;
      video.setAttribute("onClick","clickevent_peer_video(this.id)");

      //video_content[index].setAttribute("id", id);
      video_content[index].insertBefore(video, video_content[index].firstChild);

      $(".video_content:last").append("<button class='video_btn' style='opacity:0'>경고</button>");
      $(".video_content:last").append("<button class='video_btn' style='opacity:0'>강퇴</button>");
      $(".video_content:last").append("<button class='video_btn' style='opacity:0'>채팅금지</button>");

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
    },
    attachStream : { 
      onaddtrack : function (event) {
        var chat = getElementById("chat");
        chat.textContent = "get add track"
    }
  }
};


function createButtonClickHandler() {
    capacity = document.getElementById('capacity').value;
    capacity = Number(capacity);
    captureUserMedia(function() {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
        });
    });
    updateLayout(capacity);
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.id="local_video";
    video.muted = "true"; //본인 마이크 음소거
    //video.setAttribute('controls', true); //재생버튼 및 재생시간
    //participants.insertBefore(video, participants.firstChild);
    localvideo.insertBefore(video, localvideo.firstChild); //insert video in localvideo tag 

    video_constraints = { 
      width : { min:320, ideal : 320 },
      height : { min:180, ideal :180 }
    }

    getUserMedia({
        video : video,
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
var peervideo = document.getElementById("peer_video") || document.body;
var video_content = document.getElementById("video_content") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    var header = document.getElementsByTagName('h1');
    header[0].style.display = 'none';

    var non_visual = document.getElementsByClassName('non-visual');
    non_visual[0].style.display = 'block'; //hide peer connection page factor
}

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function() {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

function updateLayout(num) {
  // update CSS grid based on number of diplayed videos
    var rowHeight = '-webkit-fill-available';
    var colWidth = '-webkit-fill-available';
    var col_num = 1 ,row_num=1;

    if(num>1 && num<=4){
      rowHeight = '1fr';
      colWidth = '1fr';
      col_num = '2';
      row_num = '2';
    }
    else if (num > 4 && num <= 9) {
    rowHeight = '1fr';
    colWidth = '1fr';
      col_num = '3';
      row_num = '3';
    }
    else if (num >9 && num <= 16) {
      rowHeight = '1fr'
      colWidth = '1fr'
      col_num = '4';
      row_num = '4';
    }
    else if (num>16){
      colWidth = '1fr'
      rowHeight = '1fr'
      col_num = '5';
      row_num = '6';
    }

    document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
    document.documentElement.style.setProperty(`--colWidth`, colWidth);
    document.documentElement.style.setProperty(`--row_num`, row_num);
    document.documentElement.style.setProperty(`--col_num`, col_num);
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
  
  //config.attachStream.removeTrack(config.attachStream.getVideoTracks()[0]);
  //config.attachStream.addTrack(canvasStream.getVideoTracks()[0]);
  for (id = 0; id < peerConnections.length; id++) {
    var senderlist = peerConnections[id].peer.getSenders();
    senderlist.forEach(function (sender) {
      sender.replaceTrack(canversStream.getVideoTracks()[0]);
    })
  }

  //arrPeers.forEach(function(element) { 
  //  peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
  //});
}

function hideWhiteBoard() {
  document.getElementById("whiteBoard").style.display = 'none';
  
  for (id = 0; id < peerConnections.length; id++) {
    var senderlist = peerConnections[id].peer.getSenders();
    senderlist.forEach(function (sender) {
      sender.replaceTrack(tempStream);
    })
  }
  
  //arrPeers.forEach(function(element) { 
  //  peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
  //});
}

function clickevent_peer_video(id) {      //add button in peer-video
  document.getElementById(id).style.opacity = 0.5;
  var query = "#"+id;
  $(query).parent(".video_content").children(".video_btn").css("opacity","1");
  //btn.style.opacity = 1;
  
  setTimeout(function () {
    document.getElementById(id).style.opacity = 1;
    $(query).parent(".video_content").children(".video_btn").css("opacity", "0");
  }, 5000);
}

//자리비움
var isLeaving = false;
function leaving() {
  var leaveIcon = document.getElementById('leaveIcon');
  var micIcon = document.getElementById('micIcon');
  var cameraIcon = document.getElementById('cameraIcon');

  var micBtn = document.getElementById('micBtn');
  var cameraBtn = document.getElementById('cameraBtn');

  if(!isLeaving) {  //자리비움 실행
    leaveIcon.style.color="#FA4949";
    micIcon.style.color="#FA4949";
    cameraIcon.style.color="#FA4949";

    micBtn.disabled = 'disabled';
    cameraBtn.disabled = 'disabled';

    if(config.attachStream.getAudioTracks()[0].enabled) {
      config.attachStream.getAudioTracks()[0].enabled = false
      document.getElementById("micIcon").classList.replace('fa-microphone', 'fa-microphone-slash');
    }
    if(config.attachStream.getVideoTracks()[0].enabled) {
      config.attachStream.getVideoTracks()[0].enabled = false;
      document.getElementById("cameraIcon").classList.replace('fa-video', 'fa-video-slash');
    }
  }
  else {  //자리비움 취소
    leaveIcon.style.color="white";
    micIcon.style.color="white";
    cameraIcon.style.color="white";

    micBtn.disabled = false;
    cameraBtn.disabled = false;

    config.attachStream.getAudioTracks()[0].enabled = true;
    document.getElementById("micIcon").classList.replace('fa-microphone-slash', 'fa-microphone');
    config.attachStream.getVideoTracks()[0].enabled = true;
    document.getElementById("cameraIcon").classList.replace('fa-video-slash', 'fa-video');
  }
  
  isLeaving? isLeaving = false : isLeaving = true;
}

function toggleFullScreen() { //전체화면
  let elem = document.querySelector("body");

  if (!document.fullscreenElement) {
    if (elem.requestFullScreen) {
      elem.requestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // IE
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozExitFullscreen) {
      document.mozExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE
    }
  }
}

var success;
var bg = document.createElement('div');
var modal = document.getElementById('testConcentration')
function testConcentration() {
  success = false;
  var zIndex = 9999;
  bg.setStyle({
      position: 'fixed',
      zIndex: zIndex,
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: 'rgba(0,0,0,0.4)'
  });
  document.body.append(bg);

  modal.setStyle({
      position: 'fixed',
      display: 'block',
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',

      zIndex: zIndex + 1,

      // div center 정렬
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      msTransform: 'translate(-50%, -50%)',
      webkitTransform: 'translate(-50%, -50%)'
  });

  document.getElementById("randomNumber").innerHTML=makeRandomNumber();


  //타이머
  var time = 15;  //타임 설정
  var min = "";
  var sec = "";
  var timer = setInterval(function() {
    min = parseInt(time / 60);
    sec = time % 60;

    if(min < 10 && sec < 10) {
      document.getElementById("timer").innerHTML = "0" + min + " : 0" + sec;
    }
    else if (min < 10) {
      document.getElementById("timer").innerHTML = "0" + min + " : " + sec;
    }
    else if (sec < 10) {
      document.getElementById("timer").innerHTML = min + " : " + "0" + sec;
    }
    else {
      document.getElementById("timer").innerHTML = min + " : " + sec;
    }

    time--;

    if(success == true) {  //잘 입력했으면 타이머 중지
      clearInterval(timer);
    }
    if(time < 0) {  //타임오버
      clearInterval(timer);
      document.getElementById("timer").innerHTML = "집중 안해요?";
    }
  }, 1000);
}

// Element 에 style 한번에 오브젝트로 설정하는 함수 추가
Element.prototype.setStyle = function(styles) {
  for (var k in styles) this.style[k] = styles[k];
  return this;
};

function maxLengthCheck(object){
  if (object.value.length > object.maxLength){
    object.value = object.value.slice(0, object.maxLength);
  }    
}

var randomNumber;
function makeRandomNumber() {
  randomNumber = Math.floor(Math.random() * 9 + 1);  //1~9까지
 
  return randomNumber;
}

function submit_concentration() {
  var inputNumber = document.getElementById('input_randomNumber').value;

  if(inputNumber == randomNumber) {
    success = true;
    bg.remove();
    modal.style.display = 'none';
    document.getElementById('guideWord').innerHTML = "위 숫자를 입력해주세요.";
  }
  else {
    document.getElementById('guideWord').innerHTML = "틀렸습니다";
  }
  document.getElementById('input_randomNumber').value="";
}


//녹화 기능
let recordedBlobs;
var recordStart = true;
var recordButton = document.getElementById("record");
recordButton.addEventListener("click", ()=>{
    if (recordStart == true) {
      recordStart = false;
      startRecording();
      recordButton.style.color = "red";
    } else {
      recordStart = true;
      stopRecording();
      downloadButton.disabled = false;
      recordButton.style.color = "white";
    }
})


function getDateFormat(date, delimiter) { //날짜 구하기 > filename
  var newDate = new Date();
  if (date != null) newDate = date;

  var yy = newDate.getFullYear();
  var mm = newDate.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  var dd = newDate.getDate();
  if (dd < 10) dd = "0" + dd;

  if (delimiter == null) delimiter = "";
  return yy + delimiter + mm + delimiter + dd;
}

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, { type: 'video/webm' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  file_name = getDateFormat(new Date());
  file_name.concat(".webm");
  a.download = file_name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  var record_option = {
    audio: true ,
    video: true
  }
  recordedBlobs = [];
  var canvas = document.getElementById("local_video")
  // Optional frames per second argument.
  var stream = canvas.captureStream(25);
  var recordedChunks = [];

  console.log(stream);
  var options = { mimeType: "video/webm; codecs=vp9" };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not supported`);
    options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = { mimeType: '' };
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}

//화면공유 기능

function screenshare_suc(screenStream) {
  screenshare.disabled = true;

  tempStream = config.attachStream.getVideoTracks();
  //config.attachStream.removeTrack(config.attachStream.getVideoTracks()[0]);
  //config.attachStream.addTrack(screenStream.getVideoTracks()[0]);


  for(id=0;id<peerConnections.length;id++){
    var senderlist=peerConnections[id].peer.getSenders();
    senderlist.forEach(function(sender){
      sender.replaceTrack(screenStream.getVideoTracks()[0]);
    })
    
    //senderlist.forEach(function(sender){
      //peerConnections[id].peer.removeTrack(sender);
    //});
    //peerConnections[id].peer.addTrack(screenStream.getVideoTracks()[0]);
    //peerConnections[id].peer.createOffer();
    //peerConnections[id].peer.setLocalDescription();
    //peerConnections[id].setRemoteDescription()
  }

  // arrPeers.forEach(function (element) {
  //   peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
  // });

  // demonstrates how to detect that the user has stopped
  // sharing the screen via the browser UI.
  screenStream.getVideoTracks()[0].addEventListener('ended', () => {
    config.attachStream.removeTrack(config.attachStream.getVideoTracks()[0]);
    config.attachStream.addTrack(tempStream);

    for (id = 0; id < peerConnections.length; id++) {
      var senderlist = peerConnections[id].peer.getSenders();
      senderlist.forEach(function (sender) {
        sender.replaceTrack(tempStream);
      })
    }
    // arrPeers.forEach(function (element) {
    //   peerConnections[element].pc.createOffer().then(description => createdDescription(description, element));
    // });

    errorMsg('The user has ended sharing the screen');
    screenshare.disabled = false;
  });
}

function screenshare_err(error) {
  errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

const screenshare = document.getElementById('screenshare');
screenshare.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
    .then(screenshare_suc, screenshare_err);
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
  screenshare.disabled = false;
} else {
  errorMsg('getDisplayMedia is not supported');
}