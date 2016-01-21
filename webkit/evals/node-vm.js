var fs = require('fs');
var VM = require('vm');

module.exports = function(filename, window, Module){
  var file = fs.readFileSync(filename);
  var script = new VM.Script('console.log("startingWebkit");' + file + 'console.log("afterWebkit");');

  window.Module = Module;
  window.window.Module = Module;

  console.log('before run');
  var context = new VM.createContext(window);

  debugger;
  script.runInContext(context);
  console.log('aftervm');
};
