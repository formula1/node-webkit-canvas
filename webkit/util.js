'use strict';

module.exports.cloneObject = function(event){
  var ret = {};
  for(var x in event){
    if(x == x.toUpperCase()) continue;
    var prop = event[x];
    if(typeof prop === 'number' || typeof prop === 'string') ret[x] = prop;
  }

  return ret;
};
