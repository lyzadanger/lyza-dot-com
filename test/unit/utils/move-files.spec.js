/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs-extra').readdir);
var moveFiles   = require('../../../build/utils/move-files');
var utils  = require('../../utils');

var filesPath = path.join(utils.basePath(), 'files/move-files');
var outputPath = path.join(utils.basePath(), 'files');

describe('unit/utils/move-files', function () {
  describe('moving files with ignore pattern', function () {
    before (function () {
      return moveFiles(filesPath, outputPath, { ignore: /\.md/ });
    });
    it ('should move files to output path', function () {
      expect(utils.fileExists(outputPath + '/1.txt')).to.be.true;
      expect(utils.fileExists(outputPath + '/lyza-2.gif')).to.be.true;
    });

    it ('should not move ignored files', function () {
      expect(utils.fileExists(outputPath + '/another.md')).to.be.false;
      expect(utils.fileExists(outputPath + '/index.md')).to.be.false;
    });
  });
  describe('moving files without ignore pattern', function () {
    before(function () {
      return moveFiles(filesPath, outputPath);
    });

    it('should not leave any files in the source dir', function () {
      return readdir(filesPath).then(function (files) {
        expect(files).to.be.an('array');
        expect(files).to.have.length(0);
        return files;
      });
    });

    it('should move all files to the output dir', function () {
      return readdir(outputPath).then(function (files) {
        expect(files).to.be.an('array');
        expect(files).to.have.length.above(2);
        return files;
      });
    });
  });
});
