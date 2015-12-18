/*eslint no-console: 0 */
'use strict';

var fs = require('fs-extra');
var File = require('vinyl');
var path = require('path');

module.exports = {
  basePath: function () {
    return path.join(__dirname, '/temp/');
  },
  fixturesPath: function () {
    return path.join(__dirname, '/fixtures/');
  },
  fileContains: function (filePath, contents) {
    var fileContents = fs.readFileSync(filePath, 'utf8');
    return fileContents.indexOf(contents) !== -1;
  },
  fileExists : function (filePath) {
    var stats;
    try {
      stats = fs.statSync(filePath);
    } catch (err) {
      return false;
    }
    return stats && stats.isFile();
  },
  getVinyl: function (filePath) {
    return new File({
      path: filePath,
      contents: Buffer(fs.readFileSync(filePath, 'utf8'))
    });
  }
};
