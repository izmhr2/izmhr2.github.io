'use strict';

let localStream = null;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(function (stream) {
    // Success
    $('#my-video').get(0).srcObject = stream;
    localStream = stream;
  }).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
  });

let peer = null;
let existingCall = null;

let id = null;

$('#my-id-inputted').val(localStorage.getItem('myid'));
$('#callto-id').val(localStorage.getItem('remoteid'));

$('#input-my-id').submit(function(e) {
  e.preventDefault();
  id = $('#my-id-inputted').val();

  localStorage.setItem('myid', id);

  peer = new Peer(id, {
    key: '9556d9a1-9950-4914-8d0b-95f8418ff8eb',
    debug: 3
  });

  peer.on('open', function () {
    console.log("open");
    $('#my-id').text(peer.id);
  });
  
  peer.on('error', function (err) {
    alert(err.message);
  });
  
  peer.on('close', function () {
  });
  
  peer.on('disconnected', function () {
  });
  
  $('#make-call').submit(function (e) {
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
    console.log("make-call");
  });
  
  $('#end-call').click(function () {
    existingCall.close();
  });
  
  peer.on('call', function (call) {
    call.answer(localStream);
    setupCallEventHandlers(call);
    console.log("called");

    let remoteid = call.remoteId;
    localStorage.setItem('remoteid', remoteid);
  });
});

function setupCallEventHandlers(call) {
  if (existingCall) {
    existingCall.close();
  };

  existingCall = call;

  call.on('stream', function (stream) {
    console.log("on stream (reply)");
    addVideo(call, stream);
    setupEndCallUI();
    $('#their-id').text(call.remoteId);
  });

  call.on('close', function () {
    removeVideo(call.remoteId);
    setupMakeCallUI();
  });
}

function addVideo(call, stream) {
  $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId) {
  $('#their-video').get(0).srcObject = undefined;
}

function setupMakeCallUI() {
  $('#make-call').show();
  $('#end-call').hide();
}

function setupEndCallUI() {
  $('#make-call').hide();
  $('#end-call').show();
}