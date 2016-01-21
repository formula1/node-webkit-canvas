var Worker = require('webworker-threads').Worker;

var worker = new Worker(`${__dirname}/webworker.worker.js`);

worker.onmessage = function(data){
  console.log(data);
};
