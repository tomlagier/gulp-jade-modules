var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var resolve = require("resolve");
var vinylFile = require("vinyl-file");

//Params
//  (object)[optional] options -
//    {
//      flag: (string) default "@@", flag before include to resolve in node_modules
//      extension: (string) default "jade", file type of include,
//      paths: (array) array of strings to always attempt to resolve partials in
//    }
//Returns
//  (stream) fully resolved stream of all included/extended files
module.exports = function JadePathWriter(options) {

  options = options || {};
  this.options = options;

  //Trigger after include
  this.options.flag = options.flag || "@@";

  //File extension
  this.options.extension = options.extension || "jade";

  //Params
  //  (string) fileContents - contents of file to parse
  //Return
  //  [{
  //    path: (string) matched file path,
  //    nodeModule: (bool) should resolve in node_modules
  //  }, ...]
  this.parsePaths = function(fileContents) {

    //Matches [includes|extends] [(optional)flag][path][extension]
    //ex: extends ./templates/_overlay.jade
    //ex: include @@my-templates/_button.jade
    var jadeRegex = new RegExp("(?:include\\s|extends\\s)(?:[\'|\"])?(" + options.flag + "|)(.*\." + options.extension + "?)(?:[\'|\"|\\s])", "gi");
    var match,
        paths = [];

    //Flag whether each parsed path should be resolved to node_modules or not
    while((match = jadeRegex.exec(fileContents)) !== null) {
      paths.push({
        path: match[2],
        nodeModule: match[1] === options.flag
      });
    }

    return paths;
  }

  //Params
  //  (string) filePath - current file path (probably relative)
  //  (bool) isModule - whether to resolve in node_modules or not
  //  (array) currentPrefixes - prefixes to attempt to resolve file in
  //Returns
  //  (string) fully resolved path. undefined if path does not exist
  this.resolvePath = function(filePath, isModule, currentPrefixes) {
    return isModule ? this.resolveNodePath(filePath) : this.resolveLocalPath(filePath, currentPrefixes);
  }

  //Params
  //  (string) filePath - current file path (probably relative)
  //  (array) currentPrefixes - prefixes to attempt to resolve file in
  //Returns
  //  (string) fully resolved path. undefined if path does note exist
  this.resolveLocalPath = function(filePath, currentPrefixes){

    //Root and local directory are our basis
    var prefixes = [
      path.sep,
      "." + path.sep
    ];

    //Check other prefixes
    if(options.paths) {
      prefixes = prefixes.concat(this.options.paths);
    }

    //Merge our relative prefixes
    if(currentPrefixes) {
      prefixes = prefixes.concat(currentPrefixes)
    }

    //Make sure we have a leading slash for our path in case our prefixes are given without a separator
    if(filePath[0] !== path.sep) {
      filePath = path.sep + filePath;
    }

    //Sort by number of separators in prefix, descending
    var sortedPrefixes = _.sortBy(prefixes, function(prefix){
      return prefix.split(path.sep).length;
    }).reverse();

    //Break on our first existing path, returning the longest (most specific) matching path
    var exists = false, testPath;
    for(var i = 0; (i < sortedPrefixes.length) && (!exists); i++) {
      testPath = path.resolve(sortedPrefixes[i] + filePath);
      try {
        fs.lstatSync(testPath);
        exists = true;
      } catch(e) {}
    }

    return exists ? testPath : undefined;
  }

  //Params
  //  (string) filePath - current file path (relative to node_modules)
  //Returns
  //  (string) fully resolved path. undefined if path does not exist
  this.resolveNodePath = function(filePath){

    try {
      var fullPath = resolve.sync(filePath);
    } catch(e) {
      return undefined;
    }
    return fullPath;
  }

  //Params
  //  (file) file - current file stream
  //  (array) paths - array of paths within file to rewrite
  //    [{
  //      path: (string) path within original file to replace,
  //      fullPath: (string) fully resolved path to write instead
  //    }, ...]
  //Returns
  //  (file) rewritten file
  this.rewritePaths = function(file, paths) {
    var contents = String(file.contents);

    _.each(paths, function(path) {
      if(!path.nodeModule) {
        contents = contents.replace(path.path, path.fullPath);
      } else {
        contents = contents.replace(options.flag + path.path, path.fullPath);
      }
    });

    file.contents = new Buffer(contents, 'utf8');

    return file;
  }

  //Called recursively to process the file tree of includes and extends
  //Params
  //  (file) file - file stream to rewrite
  //  (array) prefixes - prefixes to check relative paths against
  //Returns
  //  (array) all file streams
  this.processFile = function(file, prefixes) {
    //Matches common Jade includes and extends
    var paths = this.parsePaths(String(file.contents)), resolvedPath, childFile, contents, dirname, files = [], allFiles;

    _.each(paths, function(modulePath, ind) {
      //Resolve each one of our paths
      paths[ind].fullPath = this.resolvePath(modulePath.path, modulePath.nodeModule, prefixes);

      //If path resolved successfully
      if(paths[ind].fullPath) {

        //Load file and pass current directory as prefix
        childFile = vinylFile.readSync(paths[ind].fullPath);
        dirname = path.dirname(paths[ind].fullPath);

        //Process child files
        //Remove all duplicates
        allFiles = files.concat(this.processFile(childFile, [dirname]));
        var isUnique = true;
        allFiles.forEach(function(file){
          isUnique = true;
          files.forEach(function(testFile){
            if(testFile.path === file.path) {
              isUnique = false;
            }
          });

          if(isUnique) {
            files.push(file);
          }
        });
      }
    }.bind(this));

    //rewrite paths in file
    file = this.rewritePaths(file, paths);

    files.push(file);

    return files;
  }
}
