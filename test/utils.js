/*eslint no-console: 0 */
'use strict';

var fs = require('fs-extra');
var File = require('vinyl');
var path = require('path');

module.exports = {
  basePath: function () {
    return path.join(__dirname, '/temp/');
  },
  fileContains: function (filePath, contents) {
    var fileContents = fs.readFileSync(filePath, 'utf8');
    return fileContents.indexOf(contents) !== -1;
  },
  fileExists : function (filePath) {
    var stats = fs.statSync(filePath);
    return stats.isFile();
  },
  getVinyl: function (filePath) {
    return new File({
      path: filePath,
      contents: Buffer(fs.readFileSync(filePath, 'utf8'))
    });
  }
};
