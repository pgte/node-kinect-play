var domready = require('domready');

domready(function () {
  var canvas = document.getElementById('canvas');
  var c = canvas.getContext('2d');
  var imageData = c.createImageData(640, 480);
  var imageData_ = imageData.data;

  var fresh = false;
  var painted = true;

  function handleVideo(message) {
    if (! painted) return;
    var sourceIndex = 0, imageDataIndex;
    var sourceData = new Uint8Array(message.data);
    var pos = 0;
    while(sourceIndex < sourceData.length) {
      imageDataIndex = pos * 4;

      imageData_[imageDataIndex] = sourceData[sourceIndex++];
      imageData_[imageDataIndex + 1] = sourceData[sourceIndex++];
      imageData_[imageDataIndex + 2] = sourceData[sourceIndex++];

      pos ++;
    }
    fresh = true;
    painted = false;
  }

  (function() {
    var video = new WebSocket(
      'ws://' +
      window.document.location.hostname + ':' +
      window.document.location.port +
      '/video'
    );
    video.binaryType = 'arraybuffer';
    video.onmessage = handleVideo;
  }());

  function handleDepth(message) {
    if (! fresh) return;
    var sourceIndex = 0;
    var sourceData = new Uint8Array(message.data);
    var pos = 0;
    var imageDataIndex;
    var distance;

    while(sourceIndex < sourceData.length) {
      imageDataIndex = pos * 4;
      //distance = (sourceData[pos] + sourceData[pos + 1] * 0x100) >> 3;
      distance = (sourceData[pos * 2 + 1] << 5) + (sourceData[pos * 2]) >> 3;
      //if (sourceIndex < 100) console.log('distance:', distance);
      imageData_[imageDataIndex + 3] = distance;
      sourceIndex += 2;

      pos ++;
    }
    fresh = false;
    c.putImageData(imageData, 0, 0);
    painted = true;
  }

  (function() {
    var depth = new WebSocket(
       'ws://' +
       window.document.location.hostname + ':' +
       window.document.location.port +
       '/depth'
    );
    depth.binaryType = 'arraybuffer';
    depth.onmessage = handleDepth;
  }());


});