

var mpath = require('mpath');

var Style;

module.exports = Style = function(node){
  this.node = node;
  this._attributes = {};
};

var proto = Style.prototype;

proto.removeProperty = function(property){
  mpath.set(property.split('-').join('.'), null, this._attributes);
};
