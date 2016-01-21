'use strict';

var Worker = require('webworker-threads').Worker;
var cloneObject = require('./util').cloneObject;
var EE = require('events').EventEmitter;

var WorkerHandler;

module.exports = WorkerHandler = function(settings){
  EE.call(this);

  this.canvas = settings.canvas;

  this.worker = !settings.accelerated ? new Worker(settings.path) : null;
  this.workerResponded = false;
  var queue = [];
  var lastcommand = null;

  this.wrap = function(func, returntype, argtypes){
    queue.push({ wrap:func, returntype:returntype, argtypes:argtypes });
    return function(){
      queue.push({ call:func, arguments:JSON.stringify(arguments) });
    };
  };

  this.queueRunner = function(){
    if(!this.workerResponded) return;
    if(lastcommand && lastcommand.call){
      this.emit('done', lastcommand.call);
      lastcommand = null;
    }

    if(queue.length > 0){
      var cmd = queue.shift();
      lastcommand = cmd;
      if(cmd.call) this.emit('call', cmd.call);
      this.workerResponded = false;
      this.worker.postMessage(cmd);
    }
  }.bind(this);

  this.worker.onmessage = this.workerOnMessage.bind(this);
};

var proto = WorkerHandler.prototype = Object.create(EE.prototype);

proto.workerOnMessage = function(event){

  if(!this.workerResponded) this.workerResponded = true;

  var data = event.data;
  switch(data.target){
    case 'status':{
      switch(data.context){
        case 'next': this.queueRunner(); break;
        case 'error': this.emit('error', data); break;
        case 'ready': this.queueRunner(); this.emit('ready', null); break;
      }
      break;
    }

    case 'stdout': this.emit('log', data.content); break;
    case 'stderr': this.emit('error', data.content); break;
    case 'window':{
      console.log('calling window function', data.method);
      window[data.method]();
      break;
    }

    case 'canvas':{
      switch(data.op){
        case 'resize':{
          this.emit('resize', data);
          this.worker.postMessage({
            target: 'canvas',
            boundingClientRect: cloneObject(this.canvas.getBoundingClientRect()),
          });
          break;
        }

        case 'render': this.emit('render', data); break;
        default: throw 'Unknown command from canvas sub-worker.';
      }
      break;
    }

    default: throw 'Unknown command from sub-worker.';
  }
};
