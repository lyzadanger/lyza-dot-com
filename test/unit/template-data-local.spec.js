/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var utils  = require('../utils');

var templateDataLocal = require('../../build/utils/template-data-local');
var frontMatter = require('../../build/utils/yaml').getFrontMatter;

var config = require('../../build/config');

var basePath = utils.basePath();
var postsPath = path.join(basePath, config.dirs.posts);
var pagesPath = path.join(basePath, config.dirs.pages);

describe('unit/utils/template-data-local', function () {
  describe('local context for post', function () {
    var filePath,
      fileAttributes,
      localContext;

    before(function () {
      filePath = postsPath + '/2015/11/05/talking-to-myself-with-git/index.md';
      fileAttributes = frontMatter(filePath);
      localContext = templateDataLocal(filePath, fileAttributes);
    });

    it('should know it is a post', function () {
      expect(localContext.isPost).to.be.true;
      expect(localContext.contentType).to.equal('post');
    });

    it('should have webified attributes', function () {
      expect(localContext.datePublishedISO).to.be.a('string');
      expect(localContext.blurb).to.contain('<a href=');
    });
  });

  describe('local context for page', function () {
    var filePath,
      fileAttributes,
      localContext;

    before(function () {
      filePath = pagesPath + '/about/index.md';
      fileAttributes = frontMatter(filePath);
      localContext = templateDataLocal(filePath, fileAttributes);
    });

    it('should know it is a page', function () {
      expect(localContext.isPage).to.be.true;
      expect(localContext.contentType).to.equal('page');
    });

    it('should retain front matter attributes', function () {
      expect(localContext.isAboutPage).to.be.true;
      expect(localContext.template).to.equal('about');
    });
  });

});
