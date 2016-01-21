'use strict';

var UserHandler;

module.exports = UserHandler = function(settings){
  if(typeof settings.log != 'undefined') this.print = settings.log;
  if(typeof settings.error != 'undefined') this.printErr = settings.error;
  if(typeof settings.status != 'undefined') this.setStatus = settings.status;
};

var proto = UserHandler.prototype;

proto.print = function(){ console.log(Array.prototype.slice.call(arguments).join(' ')); };

proto.printErr = function(){ console.error(Array.prototype.slice.call(arguments).join(' ')); };

proto.setStatus = function(){ console.log(Array.prototype.slice.call(arguments).join(' ')); };
