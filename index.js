/*eslint-env node*/
"use strict";

var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var through = require("through2");
var resolve = require("resolve");
var vinylFile = require("vinyl-file");

function JadePathWriter(options) {

  options = options || {};

  options.suffix = options.suffix || "jade";
  options.prefix = options.prefix || "@@";

  function parsePaths(fileContents) {
    var jadeRegex = new RegExp("(?:include\\s|extends\\s)(?:[\'|\"])?(" + options.prefix + "|)(.*\." + options.suffix + "?)(?:[\'|\"|\\s])", "gi");
    var match,
        paths = [];

    while((match = jadeRegex.exec(fileContents)) !== null) {
      if(match[1] === options.prefix) {
        paths.push({
          path: match[2],
          nodeModule: true
        });
      } else {
        paths.push({
          path: match[2],
          nodeModule: false
        });
      }
    }

    return paths;
  }

  function resolvePath(filePath, isModule, currentPrefixes) {

    var returnPath, exists, fullPath;

    //If it's not a module, resolve relative to the project
    if(!isModule) {
      exists = false;
      var testPath;

      var prefixes = [
        "",
        "./"
      ];

      //Check other prefixes
      if(options.prefixes) {
        prefixes = prefixes.concat(options.prefixes);
      }

      //Merge our relative prefixes
      if(currentPrefixes) {
        prefixes = prefixes.concat(currentPrefixes)
      }

      //Make sure we're based out of a
      if(filePath[0] !== path.sep) {
        filePath = path.sep + filePath;
      }

      _.each(prefixes, function(prefix) {
        try {
          testPath = path.resolve(prefix + filePath)
          // console.log(testPath);
          fs.lstatSync(testPath);
          exists = true;
        } catch(e) {}
      });

      returnPath = {
        exists: exists,
        path: exists ? testPath: undefined
      }

    //If it is a module, resolve through the node_modules directory
    } else {
      try {
        fullPath = resolve.sync(filePath);
        exists = true;
      } catch (e) {
        exists = false;
      }

      returnPath = {
        exists: exists,
        path: fullPath
      }
    }

    return returnPath.exists ? returnPath.path : undefined;
  }

  function rewritePaths(file, paths) {
    var contents = String(file.contents);

    _.each(paths, function(path) {
      if(!path.nodeModule) {
        contents = contents.replace(path.path, path.fullPath);
      } else {
        contents = contents.replace(options.prefix + path.path, path.fullPath);
      }
    });

    file.contents = new Buffer(contents, 'utf8');

    return file;
  }

  var files = [];

  function processFile(file, prefixes) {
    //Matches common Jade includes and extends
    var paths = parsePaths(String(file.contents)), resolvedPath, childFile, contents, dirname;

    _.each(paths, function(modulePath, ind) {
      paths[ind].fullPath = resolvePath(modulePath.path, modulePath.nodeModule, prefixes);
      if(modulePath.fullPath) {
        childFile = vinylFile.readSync(paths[ind].fullPath);
        contents = String(childFile.contents);
        dirname = path.dirname(paths[ind].fullPath);
        processFile(childFile, [dirname]);
      }
    });

    //rewrite paths in file
    file = rewritePaths(file, paths);

    //Add files to stream
    files.push(file);
  }

  return through.obj(function(file, encoding, cb){
    processFile(file);
    _.each(files, function(file) {
      this.push(file)
    }.bind(this));
    cb();
  });
}

//Function signature of exported plugin
module.exports = function(options) {
  options = options || {};

  return new JadePathWriter(options);
};
