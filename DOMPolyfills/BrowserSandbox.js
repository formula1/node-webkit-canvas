'use strict';

var Window = require('./Window');
var Image = require('canvas').Image;
var Blob = require('w3c-blob');
var URL = require('dom-urls');
var gl = require('gl/webgl');

module.exports = function(){
  var window = new Window();
  var ret = {
    window: window,
    document: window.document,
    Blob: window.Blob = Blob,
    URL: window.URL = URL,
    WebGLBuffer: window.WebGLBuffer = gl.WebGLBuffer,
    WebGLProgram: window.WebGLProgram = gl.WebGLProgram,
    WebGLFramebuffer: window.WebGLFramebuffer = gl.WebGLFramebuffer,
    WebGLRenderbuffer: window.WebGLRenderbuffer = gl.WebGLRenderbuffer,
    WebGLTexture: window.WebGLTexture = gl.WebGLTexture,
    requestAnimationFrame: window.requestAnimationFrame = setImmediate,
//    Image: window.Image = Image,
    console: console,
    setTimeout: setTimeout,
//    require: void 0,
//    process: void 0,
  };
  return ret;
};
