'use strict';

var path = require('path');
var async = require('async');
var request = require('request');
var fs = require('fs');

var urlIntoFolder = function(url, filepath){
  return function(next){
    if(fs.existsSync(filepath)) return next();
    var dirname = path.dirname(filepath);
    if(!fs.existsSync(dirname)) fs.mkdirSync(dirname);
    request(url)
    .pipe(fs.createWriteStream(filepath))
    .on('error', next)
    .on('finish', next.bind(void 0));
  };
};

async.series([
  urlIntoFolder(
    'https://raw.githubusercontent.com/trevorlinton/webkit.js/master/bin/webkit.bin.js',
    path.join(__dirname, 'web_modules', 'webkit.bin.js')
  ),
  urlIntoFolder(
    'https://raw.githubusercontent.com/trevorlinton/webkit.js/master/tests/image_test_1.html',
    path.join(__dirname, 'examples', 'test1.html')
  ),
], function(err){
  if(err) throw err;
});
