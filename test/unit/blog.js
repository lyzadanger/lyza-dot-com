/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var blog   = require('../../build/utils/blog');
var utils  = require('../utils');

var config = require('../../build/config');

var basePath = path.join(__dirname, '../temp/');
var draftsPath = path.join(basePath, config.dirs.drafts);

describe('unit/utils/blog', function () {

  describe('parsing default post (draft)', function () {

    var postFile,
      postData;

    before(function() {
      var filePath = draftsPath + '/default-post/index.md';
      postFile = utils.getVinyl(filePath);
      postData = blog.readPostData(postFile);
    });

    it('should establish correct defaults for front matter', function () {
      expect(postData).to.be.an.object;
      expect(postData.title).to.equal('Default Post');
      expect(postData.blurb).to.equal('Gimme a blurb');
      expect(postData.status).to.equal('draft');
    });

    it('should not contain publish data', function () {
      expect(postData.publish).not.to.exist;
    });

    it('should derive correct default template', function () {
      expect(postData.template).to.equal('post');
    });
  });

  describe('processing post-to-publish', function () {
    var postFile,
      postData;

    before(function() {
      var filePath = draftsPath + '/post-to-publish/index.md';
      postFile = utils.getVinyl(filePath);
      postData = blog.writePublishData(postFile);
    });

    it('should generate publish attributes', function () {
      console.log(postData);
    });
  });

});
