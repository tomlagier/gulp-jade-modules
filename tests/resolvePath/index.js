var fs = require('fs');
var JadePathWriter = require('../../jade-path-writer.js');
var chai = require('chai');
var path = require('path');

chai.should();

module.exports = describe('#resolvePath', function(){
  var jpw = new JadePathWriter();

  describe('#resolveLocalPath', function(){

    it('should return undefined if file does not exist', function(){
      var fileName = jpw.resolvePath('./badpath');
      chai.expect(fileName).to.be.undefined;
    });

    it('should return the file path if the file exists', function(){
      var fileName = jpw.resolvePath(path.resolve(__dirname + '/findThis.jade'));
      fileName.should.be.a('string');
    });

    it('should search additional paths when they are passed in', function(){
      var fileName = jpw.resolvePath('./findThis.jade', false, [__dirname]);
      fileName.should.be.a('string');
    });

    jpwWithPaths = new JadePathWriter({
      paths: [__dirname]
    });

    it('should search additional paths when configuration option is set', function(){
      var fileName = jpwWithPaths.resolvePath('./findThis.jade');
      fileName.should.be.a('string');
    });
  });

  describe('#resolveNodePath', function(){
    it('should return undefined if file does not exist', function(){
      var fileName = jpw.resolvePath('badpath', true);
      chai.expect(fileName).to.be.undefined;
    });

    it('should return the file path if the file exists', function(){
      var fileName = jpw.resolvePath('chai', true);
      fileName.should.be.a('string');
    });
  });

});
