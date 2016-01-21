'use strict';

var Document = require('./Document');
var EE = require('events').EventEmitter;

var Window;

module.exports = Window = function(){
  EE.call(this);
  this.document = new Document();
  this.document.window = this;
  this.window = this;
  this.scrollX = 0;
  this.scrollY = 0;
};

var proto = Window.prototype = Object.create(EE.prototype);

proto.addEventListener = proto.on;
proto.removeEventListener = proto.removeListener;
