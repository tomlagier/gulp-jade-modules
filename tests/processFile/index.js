var fs = require('fs');
var JadePathWriter = require('../../jade-path-writer.js');
var chai = require('chai');
var path = require('path');
var vinylFile = require('vinyl-file');

chai.should();

module.exports = describe('#processFile', function(){
  var jpw = new JadePathWriter();
  var entry = vinylFile.readSync(path.resolve(__dirname + '/start.jade'));

  var processedFiles = jpw.processFile(entry, [path.resolve(__dirname)]);
  it('should return an array', function() {
    processedFiles.should.be.a('array');
  });

  it('should return each included file', function() {
    processedFiles.should.have.length(3);
  });

});
