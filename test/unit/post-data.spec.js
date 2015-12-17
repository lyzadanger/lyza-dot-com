/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var utils  = require('../utils');

var postData = require('../../build/utils/post-data');
var frontMatter = require('../../build/utils/yaml').getFrontMatter;
var moment = require('moment');
var config = require('../../build/config');

var basePath = utils.basePath();
var postsPath = path.join(basePath, config.dirs.posts);

describe('unit/utils/post-data', function () {
  var filePath,
    postAttributes,
    data;
  before(function () {
    filePath = postsPath + '/2015/11/05/talking-to-myself-with-git/index.md';
    postAttributes = frontMatter(filePath);
    data = postData(postAttributes, config);
  });

  it('should modify blurb and title for HTML', function () {
    expect(data.blurb).to.contain('–');       // That's an em dash
    expect(data.title).to.contain('&#8217;');
  });

  it('should run blurb through markdown', function () {
    expect(data.blurb).to.contain('<p>');
    expect(data.blurb).to.contain('<a href=');
  });

  it('should generate correct url for post', function (){
    expect(data.url).to.equal('/2015/11/05/talking-to-myself-with-git/');
  });

  it('should provide publish date info', function() {
    var momentized = moment(data.datePublishedISO);
    expect(data.datePublishedISO).to.be.a('string');
    expect(moment.isMoment(data.datePublished)).to.be.true;
    expect(moment.isMoment(momentized)).to.be.true;
    expect(momentized.isSame(data.datePublished)).to.be.true;
  });


});
