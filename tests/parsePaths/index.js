var fs = require('fs');
var JadePathWriter = require('../../jade-path-writer.js');
var chai = require('chai');
var path = require('path');

chai.should();

module.exports = describe('#parsePaths', function(){
  var jpw = new JadePathWriter();

  it('should return an array', function() {
    jpw.parsePaths('').should.be.a('array');
  });

  describe('local paths', function(){

    var localPaths = fs.readFileSync(path.resolve(__dirname + '/localPaths.jade'), 'utf8');
    var parsedLocalPaths = jpw.parsePaths(localPaths);

    it('should match all local paths for unix and windows', function() {
      parsedLocalPaths.should.be.a('array');
      parsedLocalPaths.should.have.length(14);
    })

    it('should have correctly formed local path objects', function() {
      parsedLocalPaths.forEach(function(localPath){
        localPath.should.be.a('object');
        localPath.path.should.be.a('string');
        localPath.nodeModule.should.be.a('boolean');
        localPath.nodeModule.should.equal(false);
      });
    });

    it('should have the correctly parsed paths', function() {
      var correctPaths = [
        'file1.jade',
        './file2.jade',
        '/file3.jade',
        '/somewhere/file4.jade',
        '.\\file5.jade',
        'C:\\file6.jade',
        'C:\\somewhere\\file7.jade',
        'file1.jade',
        './file2.jade',
        '/file3.jade',
        '/somewhere/file4.jade',
        '.\\file5.jade',
        'C:\\file6.jade',
        'C:\\somewhere\\file7.jade'
      ];

      parsedLocalPaths.forEach(function(localPath, ind) {
        localPath.path.should.equal(correctPaths[ind]);
      });
    });
  });

  describe('node paths', function(){

    var nodePaths = fs.readFileSync(path.resolve(__dirname + '/nodePaths.jade'), 'utf8');
    var parsedNodePaths = jpw.parsePaths(nodePaths);

    it('should match all node paths for unix and windows', function(){
      parsedNodePaths.should.be.a('array');
      parsedNodePaths.should.have.length(6);
    });

    it('should have correctly formed node path objects', function() {
      parsedNodePaths.forEach(function(nodePath){
        nodePath.should.be.a('object');
        nodePath.path.should.be.a('string');
        nodePath.nodeModule.should.be.a('boolean');
        nodePath.nodeModule.should.equal(true);
      });
    });

    it('should have the correctly parsed paths', function() {
      var correctPaths = [
        'file1.jade',
        'modules/file2.jade',
        'modules\\file3.jade',
        'file1.jade',
        'modules/file2.jade',
        'modules\\file3.jade'
      ];

      parsedNodePaths.forEach(function(nodePath, ind){
        nodePath.path.should.equal(correctPaths[ind]);
      });
    });

  });

  describe('node paths with custom flag', function(){

    var jpwWithFlag = new JadePathWriter({
      flag: '##'
    });

    var customPaths = fs.readFileSync(path.resolve(__dirname + '/customPaths.jade'), 'utf8');
    var parsedCustomPaths = jpwWithFlag.parsePaths(customPaths);

    it('should match all custom paths for unix and windows', function() {
      parsedCustomPaths.should.be.a('array');
      parsedCustomPaths.should.have.length(6);
    });

    it('should have correctly formed node path objects', function(){
      parsedCustomPaths.forEach(function(customPath){
        customPath.should.be.a('object');
        customPath.path.should.be.a('string');
        customPath.nodeModule.should.be.a('boolean');
        customPath.nodeModule.should.equal(true);
      });
    });

    it('should have correctly parsed paths', function() {
      var correctPaths = [
        'file1.jade',
        'modules/file2.jade',
        'modules\\file3.jade',
        'file1.jade',
        'modules/file2.jade',
        'modules\\file3.jade'
      ];

      parsedCustomPaths.forEach(function(customPath, ind){
        customPath.path.should.equal(correctPaths[ind]);
      });
    });

  });

});
