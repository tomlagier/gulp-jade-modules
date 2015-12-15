/*eslint-env node*/
"use strict";
var _ = require("underscore");
var through = require("through2");
var path = require('path');
var JadePathWriter = require('./jade-path-writer');

//Function signature of exported plugin
module.exports = function(options) {
  options = options || {};
  var jpw = new JadePathWriter(options);

  return through.obj(function(file, encoding, cb){
    var files = jpw.processFile(file, path.dirname(file.path));
    //Add all dependency files to stream
    _.each(files, function(file) {
      this.push(file)
    }.bind(this));

    //Chain stream
    cb();
  });
};
