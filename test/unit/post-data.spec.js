/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var path   = require('path');
var blog   = require('../../build/utils/blog');
var utils  = require('../utils');

var moment = require('moment');

var config = require('../../build/config');

var basePath = path.join(__dirname, '../temp/');
var postsPath = path.join(basePath, config.dirs.posts);

describe('unit/utils/post-data', function () {
  var postFile,
    postData;
  before(function () {
    var filePath = postsPath + '/2015/11/05/talking-to-myself-with-git/index.md';
    postFile = utils.getVinyl(filePath);
    postData = blog.readPostData(postFile);
  });

  it('should do something', function () {
    //console.log(postData);
  });


});
