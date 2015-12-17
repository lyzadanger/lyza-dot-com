/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;

var templateData = require('../../build/utils/template-data');

var config = require('../../build/config');

describe('unit/utils/template-data', function () {
  describe('shared context: posts', function () {
    var postData;
    before(function() {
      postData = templateData.posts(config.blog);
    });

    it('should return a Promise resolving to Array', function () {
      this.slow(300); // Allow for known sync IO
      return postData.then(function (posts) {
        expect(posts).to.be.an('array');
        expect(posts.length).to.be.at.least(3);
      });
    });
  });

  describe('shared context: pages', function () {
    var pageData;
    before(function() {
      pageData = templateData.pages(config.blog);
    });

    it('should return a Promise resolving to Array', function () {
      this.slow(300); // Allow for known sync IO
      return pageData.then(function (pages) {
        expect(pages).to.be.an('array');
        expect(pages.length).to.be.at.least(2);
      });
    });
  });

  describe('shared context: data', function () {
    var dataData;
    before(function() {
      dataData = templateData.data(config.blog);
    });

    it('should return a Promise resolving to an Object', function () {
      this.slow(300); // Allow for known sync IO
      return dataData.then(function (data) {
        expect(data).to.be.an('object');
      });
    });

    it('should be keyed by file basename', function () {
      this.slow(300); // Allow for known sync IO
      return dataData.then(function (data) {
        expect(data).to.contain.all.keys('bio', 'media', 'works');
      });
    });
  });

  describe('shared context: all data', function () {
    var allData;
    before(function() {
      allData = templateData.all(config.blog);
    });

    it('should return a Promise resolving to an Object', function () {
      this.slow(300); // Allow for known sync IO
      return allData.then(function (all) {
        expect(all).to.be.an('object');
      });
    });

    it('should contain keys for posts, pages, data', function () {
      this.slow(300); // Allow for known sync IO
      return allData.then(function (all) {
        expect(all).to.contain.all.keys('posts', 'pages', 'data');
        expect(all.data).to.be.an('object');
        expect(all.posts).to.be.an('array');
        expect(all.pages).to.be.an('array');
      });
    });
  });
});
