'use strict';

var EE = require('events').EventEmitter;
var Style = require('./DOMNode-Style');

var DOMNode;

module.exports = DOMNode = function(name){
  EE.call(this);
  this.tagName = name;
  this.head = null;
  this.tail = null;
  this.style = new Style(this);
};

var proto = DOMNode.prototype = Object.create(EE.prototype);

proto.addEventListener = proto.on;
proto.removeEventListener = proto.removeListener;

proto.getBoundingClientRect = function(){
  return{
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: this._width,
    height: this._height,
  };
};

DOMNode.applyToObject = function(obj, name){
  for(var i in proto){
    if(i in obj) continue;
    obj[i] = proto[i];
  }

  DOMNode.call(obj, name);
};

proto.removeChild = function(child){
  var node = this.head;
  while(node && node !== child){
    node = node.next;
  }

  if(!node) throw new Error('this child is not held by this node');
  var prev = node.prev;
  var next = node.next;
  prev.next = next;
  next.prev = prev;

  if(!prev) this.head = next;
  if(!next) this.tail = prev;
  node.parentNode = null;
};

proto.insertBefore = function(newNode, refNode){
  if(newNode.parentNode) newNode.parentNode.removeChild(newNode);
  newNode.parentNode = this;
  if(!refNode.prev){
    this.head = newNode;
  }else{
    newNode.prev = refNode.prev;
  }

  refNode.prev = newNode;
  newNode.next = refNode;
};

proto.appendChild = function(node){
  if(node.parentNode) node.parentNode.removeChild(node);
  node.parentNode = this;
  if(!this.tail){
    this.head = this.tail = node;
  }else{
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }
};
