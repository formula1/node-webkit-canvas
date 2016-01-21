'use strict';

var path = require('path');
var runIt = require('./evals/node-vm');
var EE = require('events').EventEmitter;

//var VM = require('vm');
var SandboxGenerator = require('../DOMPolyfills/BrowserSandbox');

var webkitpath = path.join(__dirname, '..', 'web_modules/webkit.bin.js');

/* settings = {width:, height:, canvas:, log:, scale:, hidpi:, error:, status:, path:'path/to/webkit.release.bin.js', accelerated:true} */

var Webkit;

module.exports = Webkit = function(canvas){
  if(!canvas){
    throw new Error('A rendering target (Canvas Object) must be provided.');
  }

  var settings = {
    accelerated: true,
    path: 'webkit.bin.js',
    width: canvas.width,
    height: canvas.height,
    scale: 1,
    hidpi: false,
    canvas: canvas,
  };

  var $resize, $scaleFactor, $setTransparent, $setHtml;
  var _width = settings.width;
  var _height = settings.height;
  var _scale = settings.scale;
  var _transparent = false;
  var _html = '<html><body></body></html>';
  var _hidpi = settings.hidpi;
  var renderFrameData = null;
  var Module = {
    preRun:[], postRun:[], noInitialRun:false, noExitRuntime:false, doNotCaptureKeyboard:true,
    canvas:settings.canvas,
    print: function(){ console.log(Array.prototype.slice.call(arguments).join(' ')); },

    printErr: function(){ console.error(Array.prototype.slice.call(arguments).join(' ')); },

    setStatus: function(){ console.log(Array.prototype.slice.call(arguments).join(' ')); },

    totalDependencies: 0,
    monitorRunDependencies: function(){ },
  };

  var fireEvent = this.emit.bind(this);

  function wrap(func, returntype, argtypes){
    var cfunc = Module.cwrap(func, returntype, argtypes);
    return function(){
      fireEvent('call', func);
      var rval = cfunc(arguments[0], arguments[1]);
      fireEvent('done', func);
      return rval;
    };
  }

  function initializeInPage(){
    console.log('initialized');
    debugger;
    $resize = wrap('resize', 'number', ['number', 'number']);
    $scaleFactor  = wrap('scalefactor', 'number', ['number']);
    $setTransparent = wrap('setTransparent', 'number', ['boolean']);
    $setHtml = wrap('setHtml', 'number', ['string']);
  }

  function executeInPage(){
    console.log('exec');

    // TODO: This code is repeated from below for efficiency in loading,
    // and setting defaults, we should most likely figure out how to combine it.
    if(settings.width != 500 || settings.height != 500)
    $resize(_width, _height);
    if(settings.scale != 1 && !settings.hidpi)
    $scaleFactor(_scale);
    if(settings.hidpi && settings.accelerated){
      Module.canvas.width = _width;
      Module.canvas.height = _height;
      $scaleFactor(2);
    }

    fireEvent('ready', null);
  }

  Module.preRun = [initializeInPage];
  Module.postRun = [executeInPage];

  var sandbox = SandboxGenerator();

  runIt(webkitpath, sandbox, Module);

  var window = sandbox.window;
  var document = sandbox.document;

  function queueRunner(){}

  // render a frame of data coming from the webkit, this only applies for 2d canvases.
  function renderFrame(){
    var dst = Module.canvasData.data;
    if(dst.set){
      dst.set(renderFrameData);
    }else{
      for(var i = 0; i < renderFrameData.length; i++){
        dst[i] = renderFrameData[i];
      }
    }

    Module.ctx.putImageData(Module.canvasData, 0, 0);
    renderFrameData = null;
  }

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || renderFrame;

  ['keydown', 'keyup', 'keypress', 'blur', 'visibilitychange'].forEach(function(event){
    document.addEventListener(event, function(){
      //worker.postMessage({ target: 'document', event: cloneObject(event) });
      //event.preventDefault();
    });
  });

  ['unload'].forEach(function(event){
    window.addEventListener(event, function(){
      //worker.postMessage({ target: 'window', event: cloneObject(event) });
    });
  });

  ['mousedown', 'mouseup', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mouseout'].forEach(function(event){
    Module.canvas.addEventListener(event, function(){
      //worker.postMessage({ target: 'canvas', event: cloneObject(event) });
      //event.preventDefault();
    }, true);
  });

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

  Object.defineProperty(this, 'hidpi', {
    get:function(){ return _hidpi; },

    set:function(e){
      _hidpi = e;
      if(settings.hidpi && settings.accelerated){
        Module.canvas.width = _width;
        Module.canvas.height = _height;
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

Webkit.prototype = Object.create(EE.prototype);
Webkit.prototype.constructor = Webkit;
