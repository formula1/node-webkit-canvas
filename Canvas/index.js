'use strict';

var gl = require('gl');
var DOMNode = require('../DOMPolyfills/DOMNode');
var Canvas2d = require('canvas');

var b2ab = require('../util/BuffertoArrayBuffer');
var webglDrawImage = require('./webgl-drawImage');

var Image = Canvas2d.Image;

var Canvas;
module.exports = Canvas = function(){
  DOMNode.call(this);
  this.cur_context = void 0;
  this.curBuffer = void 0;
  this._width = 0;
  this._height = 0;
  this.type = null;
};

var proto = Canvas.prototype;

for(var i in DOMNode.prototype){
  proto[i] = DOMNode.prototype[i];
}

proto.constructor = Canvas;

proto.toBuffer = function(){
  var width = this._width, height = this._height;
  if(this.type == 'webgl'){
    var ctx = this.cur_context;
    var buff = new Uint8Array(width * height * 4);
    ctx.readPixels(0, 0, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, buff);
    return buff;
  }
};

proto.getContext = function(type, attr){
  console.log('getContext', type, this.type);
  if(!/^(webgl|2d)$/.test(type)) return null;
  if(type === this.type) return this.cur_context;
  var img;
  var width = this._width, height = this._height;

  if(this.cur_context){
    console.log('should never enter here');
    var oldBuffer;
    if(this.type === '2d'){
      oldBuffer = b2ab(this.cur_context.getBuffer());
    }else{
      oldBuffer = new Uint8Array(width * height * 4);
      this.cur_context.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, oldBuffer);
      this.cur_context.destroy();
    }

    img = new Image();
    img.src = oldBuffer;
    this.emit(`${this.contextType}contextlost`);
  }

  switch(type){
    case 'webgl':
      this.cur_context = gl(width, height, attr);
      if(img){
        webglDrawImage(this.cur_context, img);
      }

      break;
    case '2d':
      this.Canvas2d.width = this._width;
      this.Canvas2d.height = this._height;
      this.cur_context = this.Canvas2d.getContext('2d');
      if(img){
        this.cur_context.drawImage(img, 0, 0);
      }

      break;
    default:
      return null;
  }
  this.type = type;
  this.cur_context.canvas = this;
  return this.cur_context;
};

Object.defineProperty(proto, 'width', {
  get: function(){ return this._width; },

  set: function(x){
    this._width = x;
    if(this.type === 'webgl'){
      this.cur_context.resize(this._width, this._height);
    }else  if(this.type === '2d'){
      this.Canvas2d.width = x;
    }
  },
});

Object.defineProperty(proto, 'height', {
  get: function(){ return this._height; },

  set: function(y){
    this._height = y;
    if(this.type === 'webgl'){
      this.cur_context.resize(this._width, this._height);
    }else if(this.type === '2d'){
      this.Canvas2d.height = y;
    }
  },
});
