/**
 * Move all files from fromDir to toDir, ignoring
 * anything in the array ignore.
 * Return a promise to work well in the gulp chain
 */
'use strict';
var fs = require('fs');
var mv = require('mv');
var Q  = require('q');
var _  = require('lodash');

var moveFiles = function(fromDir, toDir, ignore) {
  var deferred = Q.defer();

  var processNextFile = function(files) {
    if (!files.length) {
      deferred.resolve();
      return;
    }
    var file = files.pop();
    if (_.contains(ignore, file)) {
      processNextFile(files);
    } else {
      mv(fromDir + '/' + file,
        toDir + '/' + file,
        function(err) {
          if (err) {
            deferred.reject(new Error(err));
            return;
          }
          processNextFile(files);
        });
    }
  };

  fs.readdir(fromDir, function(err, files) {
    if (err) {
      deferred.reject(new Error(err));
      return;
    }
    processNextFile(files);
  });

  return deferred;
};

module.exports = moveFiles;
