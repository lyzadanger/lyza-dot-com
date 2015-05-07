'use strict';

var config      = require('../config').blog;
var frontMatter = require('front-matter');
var moment      = require('moment');
var path        = require('path');
var slug        = require('slug');
var _           = require('lodash');

var postData = function postData(file) {
  if (file.data && file.data.dataIsParsed) {
    return file.data;
  }
  var content = frontMatter(String(file.contents));
  var defaults = {
    status  : 'draft',
    template: 'post',
    title   : path.basename(file.path, path.extname(file.path))
  };
  var data = _.defaults(content.attributes, defaults);
  data.dataIsParsed = true;
  return data;
};

var publishData = function publishData(file) {
  var data = postData(file);
  var defaults = {
    slug: slug(data.title.toLowerCase()),
    date: moment().toISOString()
  };

  var buildPostPath = function buildPostPath() {
    var postPath = [];
    var date     = moment(data.publish.date);
    config.permalinkPattern.split('/').forEach(function(chunk) {
      postPath.push(date.format(chunk));
    });
    postPath.push(data.publish.slug);
    postPath.push('index.md');
    postPath = postPath.join('/');
    return postPath;
  };
  data.publish = _.defaults(data.publish || {}, defaults);
  data.publish.path = buildPostPath();
  return data;
};

module.exports.postData = postData;
module.exports.publishData = publishData;
