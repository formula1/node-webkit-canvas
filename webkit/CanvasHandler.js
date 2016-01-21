'use strict';

var requestAnimationFrame = setImmediate || (
  window ? window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
  : setTimeout
);

var CanvasHandler;

module.exports = CanvasHandler = function(settings){
  this.renderFrameData = null;

  this.canvas = settings.canvas;
  this.ctx = this.canvas.getContext('2d');

};

CanvasHandler.prototype.resize = function(data){
  this.canvas.width = data.width;
  this.canvas.height = data.height;
  this.canvasData = this.ctx.getImageData(0, 0, data.width, data.height);
};

// is called from worker-handler
CanvasHandler.prototype.renderImage = function(data){
  var renderFrameData = this.renderFrameData;
  if(renderFrameData){
    // previous image was not rendered yet, just update image
    renderFrameData = data.image.data;
  }else{
    // previous image was rendered so update image and request another frame
    renderFrameData = data.image.data;
    requestAnimationFrame(this.renderFrame.bind(this));
  }
};

CanvasHandler.prototype.renderFrame = function(){
  var renderFrameData = this.renderFrameData;
  var dst = this.canvasData.data;
  if(dst.set){
    dst.set(renderFrameData);
  }else{
    for(var i = 0; i < renderFrameData.length; i++){
      dst[i] = renderFrameData[i];
    }
  }

  this.ctx.putImageData(this.canvasData, 0, 0);
  this.renderFrameData = null;
};
