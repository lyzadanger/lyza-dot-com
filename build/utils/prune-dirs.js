'use strict';

var walk = require('walkdir');
var fs   = require('fs');
var path = require('path');
var extfs = require('extfs');

module.exports = function(treePath, done) {
  var emptyDirs = [],
      walker,
      parentDir = path.resolve(treePath);

  var deleteEmptyPath = function deleteEmptyPath(delPath, cb) {
    extfs.isEmpty(delPath, function (isEmpty) {
      // Delete if empty AND it's not the top level dir
      if (isEmpty && delPath !== parentDir) {
        fs.rmdir(delPath, function(err) {
          // Walk up and check for emptiness until
          // we find a non-empty directory, deleting all the way
          deleteEmptyPath(path.dirname(delPath), cb);
        });
      } else {
        cb();
      }
    });
  };

  var killDirs = function(emptyDirs, done) {
    if (emptyDirs.length) {
      deleteEmptyPath(emptyDirs.pop(), function() {
        // The path and any empty parents have been removed
        // Call on the next deep path
        killDirs(emptyDirs, done);
      });
    } else {
      done();
    }
  };

  extfs.isEmpty(parentDir, function(isEmpty) {
    if (isEmpty) {
      // Nothing to do here. Either empty
      // already or doesn't exist.
      done();
    } else {
      walker = walk(treePath);
      // This will emit on an empty directory
      // but not on the empty directory's parents
      // if all they contain is this dir
      // because they are not empty YET
      walker.on('empty', function (emptyPath, stat) {
        emptyDirs.push(emptyPath);
      });
      walker.on('end', function() {
        killDirs(emptyDirs, function() {
          if (typeof done === 'function') {
            done();
          }
        });
      });
    }
  });

};
