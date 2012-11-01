var ecstatic = require('ecstatic')(__dirname + '/client');
var server = require('http').createServer(ecstatic);
var WebSocketServer = require('ws').Server;
var Kinect = require('kinect');

var port  = 8000;
var minInterval = 2000;
var wssSendOptions = {binary: true};

var videoServer = new WebSocketServer({server: server, path: '/video'});
var depthServer = new WebSocketServer({server: server, path: '/depth'});
var kinect  = Kinect();

kinect.activate('video');
kinect.activate('depth');

videoServer.on('connection', function(socket) {

  var lastSent;

  function videoListener(buf) {
    var now = Date.now();
    if (lastSent && ((now - lastSent) < minInterval)) return;
    lastSent = now;
    socket.send(buf, wssSendOptions);
  }

  kinect.on('video', videoListener);

  socket.on('close', function() {
    kinect.removeListener('video', videoListener);
  });

  kinect.resume();

});

depthServer.on('connection', function(socket) {
  var lastSent;

  function depthListener(buf) {
    var now = Date.now();
    if (lastSent && ((now - lastSent) < minInterval)) return;
    lastSent = now;
    socket.send(buf, wssSendOptions);
  }

  kinect.on('depth', depthListener);

  socket.on('close', function() {
    kinect.removeListener('depth', depthListener);
  });

  kinect.resume();

});

server.listen(port, function(err) {
  if (err) throw err;
  console.log('Server listeninig on port %d', port);
});
