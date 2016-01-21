'use strict';

var UserHandler = require('./UserHandler');
var CanvasHandler = require('./CanvasHandler');
var WorkerHandler = require('./WorkerHandler');
/* settings = {width:, height:, canvas:, log:, scale:, hidpi:, error:, status:, path:'path/to/webkit.release.bin.js', accelerated:true} */
module.exports = function(canvas){
  var settings = {
    accelerated: false,
    path: './web_modules/webkit.bin.js',
    canvas: canvas,
    width: canvas.width,
    height: canvas.height,
    scale: 1,
    hidpi: false,
  };
  var _width = settings.width;
  var _height = settings.height;
  var _scale = settings.scale;
  var _transparent = false;
  var _hidpi = settings.hidpi;

  var userhandler = new UserHandler(settings);
  var canvashandler = new CanvasHandler(settings);

  var workerhandler = new WorkerHandler(settings);
  workerhandler.on('log', userhandler.print);
  workerhandler.on('error', userhandler.printErr);
  workerhandler.on('resize', canvashandler.resize.bind(canvashandler));
  workerhandler.on('render', canvashandler.renderImage.bind(canvashandler));

  this.on = workerhandler.addListener.bind(workerhandler);
  this.off = workerhandler.removeListener.bind(workerhandler);

  var fireEvent = workerhandler.emit.bind(workerhandler);

  var _html = '<html><body></body></html>';

  var $resize, $scaleFactor, $setTransparent, $setHtml;

  var wrap = workerhandler.wrap;

  $resize = wrap('resize', 'number', ['number', 'number']);
  $scaleFactor  = wrap('scalefactor', 'number', ['number']);
  $setTransparent = wrap('setTransparent', 'number', ['boolean']);
  $setHtml = wrap('setHtml', 'number', ['string']);

  // TODO: This code is repeated from below for efficiency in loading,
  // and setting defaults, we should most likely figure out how to combine it.
  if(settings.width != 500 || settings.height != 500)
  $resize(_width, _height);
  fireEvent('ready', null);

  var queueRunner = workerhandler.queueRunner;

  // render a frame of data coming from the webkit, this only applies for 2d canvases.

  Object.defineProperty(this, 'scale', {
    get:function(){ return _scale; },

    set:function(e){
      if(_hidpi) $scaleFactor(e * 2);
      else $scaleFactor(e);
      $setHtml(this.html);
      _scale = e;
      queueRunner();
    },
  });

  this.pushMessage = function(){
    queueRunner();
  }.bind(this);

  Object.defineProperty(this, 'hidpi', {
    get:function(){ return _hidpi; },

    set:function(e){
      _hidpi = e;
      if(settings.hidpi && !settings.accelerated){
        canvas.width = _width * 2;
        canvas.height = _height * 2;
        canvas.style.webkitTransform = 'scale(0.5,0.5)';
        canvas.style.webkitTransformOrigin = '0 0';
      }else if(settings.hidpi && settings.accelerated){
        canvas.width = _width;
        canvas.height = _height;
      }

      this.scale = this.scale; // force a scale size.

      queueRunner();
    },
  });

  Object.defineProperty(this, 'html', {
    get:function(){ return _html; },

    set:function(e){
      $setHtml(e);
      _html = e;
      queueRunner();
    },
  });

  Object.defineProperty(this, 'transparent', {
    get:function(){ return _transparent; },

    set:function(e){
      $setTransparent(e);
      _transparent = e;
      queueRunner();
    },
  });

  Object.defineProperty(this, 'width', {
    get:function(){ return _width; },

    set:function(e){
      _width = e;
      $resize(_width, _height);
      queueRunner();
    },
  });

  Object.defineProperty(this, 'height', {
    get:function(){ return _height; },

    set:function(e){
      _height = e;
      $resize(_width, _height);
      queueRunner();
    },
  });

  this.resize = function(width, height){
    _width = width;
    _height = height;
    $resize(_width, _height);
    queueRunner();
  };

};
