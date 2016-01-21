'use strict';

module.exports = function(scriptpath, window, Module){

  var old = {};
  for(var i in window){
    old[i] = global[i];
    global[i] = window[i];
  }

  global.Module = Module;
  window.Module = Module;

  console.log('before run');
  debugger;
  require(scriptpath);
  console.log('aftervm');

  for(var i in old){
    global[i] = old[i];
  }
};
