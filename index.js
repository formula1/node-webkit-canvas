'use strict';
var _log = console.log;
console.log = function(text){
  if(text == 'trap!') throw new Error(text);
  _log.apply(console, arguments);
};

var Canvas = require('./Canvas');
var Webkit = require('./webkit/sync');
var async = require('async');
var pngcreate = require('./drawing/png');

var fs = require('fs');
var path = require('path');

var canvas = new Canvas();
canvas.width = 256;
canvas.height = 256;
var webkit = new Webkit(canvas);

var exFolder = path.join(__dirname, 'examples');

var saveImage = function(canvas, filepath, next){
  console.log('render');
  var buff = canvas.toBuffer();
//  console.log(buff);
  pngcreate({
    width: canvas.width,
    height: canvas.height,
    pixleHandler: function(x, y){
      var pixle = [];
      for(var i = 0; i < 4; i++) pixle[i] = buff[x + canvas.width * y + i];
      return pixle;
    },
  }, function(err, data){
    if(err) return next(err);
    fs.writeFileSync(`${filepath}.png`, data);
    next();
  });
};

webkit.on('call', function(fn){
  console.log('calling', fn);
});

webkit.on('ready', function(){
  console.log('ready');
  async.each(fs.readdirSync(exFolder),
    function(filename, next){
      if(!/\.html$/.test(filename)) return next();
      var filepath = path.join(exFolder, filename);
      webkit.once('done', saveImage.bind(void 0, canvas, filepath, next));
      webkit.html = fs.readFileSync(filepath);
    },

    function(err){
      if(err) throw err;
    }
  );
});

setInterval(console.log.bind(console, 'waiting'), 1000);
