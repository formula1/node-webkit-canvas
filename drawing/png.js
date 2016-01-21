'use strict';

var crc32 = require('buffer-crc32');
var zlib = require('zlib');
var fs = require('fs');

var writeChunk, generateImage, writeChunk, getAsBuffer;

module.exports = function(options, next){
  if(!options.hasOwnProperty('width'))
  throw new Error('need to specify frame width:options.width');
  if(!options.hasOwnProperty('height'))
  throw new Error('need to specify frame height:options.height');
  var width = options.width;
  var height = options.height;

  var butter = [];
  butter[0] = new Buffer(8);
  butter[0].writeUInt8(137, 0);
  butter[0].writeUInt8(80, 1);
  butter[0].writeUInt8(78, 2);
  butter[0].writeUInt8(71, 3);
  butter[0].writeUInt8(13, 4);
  butter[0].writeUInt8(10, 5);
  butter[0].writeUInt8(26, 6);
  butter[0].writeUInt8(10, 7);

  butter[1] = writeChunk('IHDR', [
    `32$${width}`,
    `32$${height}`,
    `8$${8}`,
    `8$${6}`,
    `8$${0}`,
    `8$${0}`,
    `8$${0}`,
  ]);

  zlib.deflate(generateImage(width, height, options.pixleHandler), function(err, result){
    if(err) return next(err);
    butter[butter.length] = writeChunk(
      'IDAT',
      result
    );
    butter[butter.length] = writeChunk('IEND', []);
    var finalBuff = Buffer.concat(butter);
    if(options.hasOwnProperty('filename')){
      var fd = fs.openSync(options.filename, 'w');
      fs.write(fd, finalBuff, 0, finalBuff.length, 0, function(writeErr){
        fs.closeSync(fd);
        if(writeErr) return next(writeErr);
        next(void 0, options.filename);
      });
    }else{
      next(void 0, finalBuff);
    }
  });

};

writeChunk = function(named, array){
  var buffed = [];
  buffed[0] = new Buffer(4);
  var temp = Buffer.isBuffer(array) ? array : getAsBuffer(array);
  buffed[0].writeUInt32BE(temp.length, 0);
  buffed[1] = new Buffer(4 + temp.length);
  buffed[1].write(named, 0, 4, 'ascii');
  temp.copy(buffed[1], 4, 0, temp.length);
  buffed[2] = crc32(buffed[1]);
  return Buffer.concat(buffed);
};

getAsBuffer = function(array){
  var datasize = 0;
  for(var i = 0; i < array.length; i++){
    var parts = array[i].split('$');
    array[i] = { size: parseInt(parts[0]) / 8, data: parseInt(parts[1]) };
    datasize += parseInt(parts[0]) / 8;
  }

  var curpos = 0;
  var buffed = new Buffer(datasize);
  for(var i = 0; i < array.length; i++){
    if(array[i].size == 1){
      buffed.writeUInt8(
        array[i].data,
        curpos
      );
    }else{
      buffed[`writeUInt${array[i].size * 8}BE`](
        array[i].data,
        curpos
      );
    }

    curpos += array[i].size;
  }

  return buffed;
};

generateImage = function(width, height, pixleCallback){
  var scanlines = [];
  console.log(width);
  console.log(height);

  for(var h = 0; h < height; h++){
    scanlines.push(new Buffer(1 + width * 4));
    scanlines[h].writeUInt8(0, 0);
    for(var w = 0; w < width; w++){
      var pixle = pixleCallback(w, h);
      for(var i = 0; i < 4; i++){
        scanlines[h].writeUInt8(pixle[i], i + w * 4 + 1);
      }
    }
  }

  console.log(scanlines.length);
  console.log(scanlines[0].length);
  return Buffer.concat(scanlines);
};
