/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var blog   = require('../../build/publish-data');
var utils  = require('../utils');

var moment = require('moment');

var config = require('../../build/config');

var basePath = path.join(__dirname, '../temp/');
var draftsPath = path.join(basePath, config.dirs.drafts);

describe('unit/publish-data', function () {

  describe('readPostData', function () {

    var postFile,
      postData;

    before(function() {
      var filePath = draftsPath + '/default-post/index.md';
      postFile = utils.getVinyl(filePath);
      postData = blog.readPostData(postFile);
    });

    it('should establish correct defaults for front matter', function () {
      expect(postData).to.be.an('object');
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

  describe('writePublishData', function () {
    var postFile,
      postData,
      publishAttrs;

    before(function() {
      var filePath = draftsPath + '/post-to-publish/index.md';
      postFile = utils.getVinyl(filePath);
      postData = blog.writePublishData(postFile);
      publishAttrs = postData.publish;
    });

    it('should generate publish attributes', function () {
      expect(publishAttrs).to.be.an('object');
      expect(publishAttrs.slug).to.equal('post-to-publish');
    });

    it('should generate correct publication date', function () {
      var now = moment();
      var pubDate = moment(publishAttrs.date);
      // They won't be EXACTLY the same time, but close
      expect(now.isSame(pubDate, 'minute')).to.be.true;
    });
  });

  describe('buildPublishPath', function () {
    var postFile,
      postData,
      postPath;

    before(function() {
      var filePath = draftsPath + '/published-post/index.md';
      postFile = utils.getVinyl(filePath);
      postData = blog.readPostData(postFile);
      postPath = blog.buildPublishPath(postData.publish);
    });

    it('should retain publish attributes', function () {
      expect(postData.publish).to.exist.and.to.be.an('object');
    });

    it('should build a path with date parts', function () {
      // Date is known to be 2015-07-28T18:45:01.680Z
      var postDate = moment('2015-07-28T18:45:01.680Z'),
        expectedPath = postDate.format('YYYY/MM/DD/'),
        expectedSlug = 'already-published-post';
      expect(postPath).to.equal(expectedPath + expectedSlug + '/index.md');
    });
  });

});
