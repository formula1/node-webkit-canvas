
module.exports = function(script, window, Module){
  var Blob = window.Blob;
  var requestAnimationFrame = window.requestAnimationFrame;
  window.Module = Module;
  window.console = console;
  var document = window.document;
  var require = void 0;
  var global = void 0;
  var process = void 0;

  console.log('before run');
  var fn = new Function(
    'document', 'Module', 'window', 'Blob', 'requestAnimationFrame', 'console',
    'console.log("startingWebkit");' + script + 'console.log("afterWebkit");'
  );

  debugger;
  fn(document, Module, window, Blob, requestAnimationFrame, console);

//  var context = new VM.createContext(sandbox);
//  script.runInContext(context);
  console.log('aftervm');
};
