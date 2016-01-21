'use strict';

var Image = require('canvas').Image;

var checkForSRC;

Object.defineProperty(Image.prototype, 'onload', {
  get: function(){
    return this._onloadFN;
  },

  set: function(fn){
    console.log('onload');
    this._onloadFN = fn;
    process.nextTick(checkForSRC.bind(this));
  },
});

checkForSRC = function(){
  if(this.src){
    return this._onloadFN();
  }

  setImmediate(checkForSRC.bind(this));
};
