Module = {
  print: function(text) { self.postMessage({ target: 'stdout', content: text }) },

  printErr: function(text) { self.postMessage({ target: 'stderr', content: text }) }
}

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

prependFile('message.txt', 'data to prepend', function(err) {
	if (err) {
		// Error
	}

	// Success
	console.log('The "data to prepend" was prepended to file!');
});
