/*eslint no-console: 0 */
'use strict';

var fs = require('fs-extra');
//var path = require('path');

module.exports = {
  fileContains: function (filePath, contents) {
    var fileContents = fs.readFileSync(filePath, 'utf8');
    return fileContents.indexOf(contents) !== -1;
  },
  fileExists : function (filePath) {
    var stats = fs.statSync(filePath);
    return stats.isFile();
  }
};
