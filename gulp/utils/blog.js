/**
 * gulp utils for blog posts (files).
 */
'use strict';

var config      = require('../config').blog;
var yamlUtil    = require('./yaml');
var frontMatter = require('front-matter');
var moment      = require('moment');
var path        = require('path');
var slug        = require('slug');
var _           = require('lodash');

/**
 * Get post-relevant data. Read front matter
 * and apply some post-specific defaults to it. Should
 * be idempotent.
 *
 * @file Vinyl File object
 */
var postData = function postData(file) {
  var content = frontMatter(String(file.contents));
  var defaults = {
    status  : 'draft',
    template: 'post',
    title   : path.basename(file.path, path.extname(file.path))
  };
  var data = _.defaults(content.attributes, defaults);
  return data;
};

/**
 * Read, extend AND WRITE relevant data
 * when publishing a post.
 *
 * @file Vinyl File object
 */
var buildPublishData = function publishData(file) {
  var data = postData(file);
  // Publish-relevant defaults
  var defaults = {
    slug: slug(data.title.toLowerCase()),
    date: moment().toISOString()
  };
  var postPath = [],
      pubDate;

  data.publish = _.defaults(data.publish || {}, defaults);
  pubDate = moment(data.publish.date);

  // Generate publish path
  config.permalinkPattern.split('/').forEach( function (chunk) {
    postPath.push(pubDate.format(chunk));
  });
  postPath.push(data.publish.slug, 'index.md');
  data.publish.path = data.publish.path || postPath.join('/');

  // Extend and write updated YAML
  yamlUtil.extend(file, { publish: data.publish });
  return data;
};

module.exports.postData = postData;
module.exports.buildPublishData = buildPublishData;
