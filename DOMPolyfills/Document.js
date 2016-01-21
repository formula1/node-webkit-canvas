'use strict';

var Canvas = require('../Canvas');
var DOMNode = require('./DOMNode');
var EE = require('events').EventEmitter;

var Document;

module.exports = Document = function(){
  EE.call(this);
};

var proto = Document.prototype = Object.create(EE.prototype);

proto.addEventListener = proto.on;
proto.removeEventListener = proto.removeListener;

proto.createElement = function(type){
  switch(type){
    case 'canvas': return new Canvas();
    default: return new DOMNode(type);
  }
};
