var path = require('path');

describe('JadePathWriter', function() {
  require(path.resolve(__dirname + '/parsePaths'));
  require(path.resolve(__dirname + '/resolvePath'));
  require(path.resolve(__dirname + '/rewritePaths'));
  require(path.resolve(__dirname + '/processFile'));
});
