/**
 * Utility to move files
 */
'use strict';
var fs      = require('fs-extra');
var Promise = require('bluebird');
var readdir = Promise.promisify(fs.readdir);
var mv      = Promise.promisify(require('mv'));

/**
 * Move all the files from fromDir to toDir except
 * any that match an optional regex in opts.include
 *
 * @param fromDir {String}
 * @param toDir   {String}
 * @return {Object}           Promise
 */
var moveFiles = function(fromDir, toDir, opts) {
  opts = opts || {};

  /**
   * Filter list of files in directory against (optional)
   * ignore option.
   *
   * @param files {Array}    of filenames from `readdir`
   * @return {Array}         of valid files to move
   */
  var filterFiles = function(files) {
    if (opts.ignore) {
      files = files.filter(function(file) {
        return !opts.ignore.test(file);
      });
    }
    return files;
  };

  /**
   * Generate a promise for each file that needs to be moved
   * and return them via `Promise.all`
   *
   * @param files {Array}     of filenames to move
   * @return {Object}         `Promise.all` with a promise for each file
   */
  var moveFilteredFiles = function (files) {
    var filePromises = files.map(function (file) {
      return mv(fromDir + '/' + file,
      toDir + '/' + file);
    });
    return Promise.all(filePromises);
  };

  return readdir(fromDir)
    .then(filterFiles)
    .then(moveFilteredFiles);

};

module.exports = moveFiles;
