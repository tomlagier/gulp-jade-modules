var fs = require('fs');
var JadePathWriter = require('../../jade-path-writer.js');
var chai = require('chai');
var vinyl = require('vinyl');
var vinylFile = require('vinyl-file');
var path = require('path');

chai.should();

module.exports = describe('#rewritePaths', function(){
  var jpw = new JadePathWriter();
  var rewriteContents = vinylFile.readSync(path.resolve(__dirname + '/toRewrite.jade'));
  var paths = [{
      path: 'path1.jade',
      fullPath: '/full/path/to/path1.jade',
      nodeModule: false
    },
    {
      path: 'path2.jade',
      fullPath: '/full/path/to/path2.jade',
      nodeModule: true
    }];
  var rewrittenFile = jpw.rewritePaths(rewriteContents, paths);

  it('should return a file object', function(){
    vinyl.isVinyl(rewrittenFile).should.equal(true);
  });

  it('should have correctly rewritten paths', function() {
    var contents = String(rewrittenFile.contents);
    var writtenPaths = jpw.parsePaths(contents);

    writtenPaths.should.have.length(2);

    writtenPaths.forEach(function(parsedPath, ind){
      parsedPath.path.should.equal(paths[ind].fullPath);
    });
  });
});
