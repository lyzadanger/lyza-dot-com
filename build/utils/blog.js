/**
 * gulp utils for blog posts (files).
 * These utils are used for file processing and publish/unpublish
 * See `context-*` for utilities to build context for rendering
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
 * Read front matter from a vinyl File and set any
 * defaults that can only be calculated if we have a file
 * object.
 */
var readPostData = function readPostData(file) {
  var content = frontMatter(String(file.contents));
  var defaults = {
    title: path.basename(file.path, path.extname(file.path))
  };
  var attributes = _.defaults(content.attributes || {}, defaults);
  attributes = postData(attributes);
  return attributes;
};

/**
 * Process, and extend YAML front matter
 * in post to record needed publish data. This function is used
 * during the publishing process (promotion).
 */
var writePublishData = function writePublishData(file) {
  var data  = readPostData(file);
  data      = publishData(data);
  data.publish.path = data.publish.path || buildPublishPath(data.publish);
  yamlUtil.extend(file, { publish: data.publish });
  return data;
};

/**
 * Get post-relevant data from already-parse front matter.
 * @param attributes Object of FM data
 */
var postData = function postData(attributes) {
  var defaults = {
    status  : 'draft',
    template: 'post'
  };
  var data = _.defaults(attributes, defaults);
  return data;
};

/**
 * Given the frontmatter publish attributes of a post, build a path
 * based on the permalink pattern in the config.
 */
var buildPublishPath = function buildPublishPath(publishAttrs) {
  var pubDate = moment(publishAttrs.date),
    postPath = [];

  // Generate publish path
  // 1. Build path elements (dirs) from permalinkPattern
  config.permalinkPattern.split('/').forEach( function (chunk) {
    postPath.push(pubDate.format(chunk));
  });
  // 2. Push slug on as dir in path
  // 3. Push `index.md` on as literal filename
  postPath.push(publishAttrs.slug, config.postFileName + config.postExtension);
  // If not already a data.publish.path, use what we just generated
  return postPath.join('/');
};

/**
 * Extend post attributes with publish-related defaults.
 * @param Object attributes Front matter attributes from post
 */
var publishData = function publishData(attributes) {
  var defaults = {
    slug: slug(attributes.title.toLowerCase()),
    date: moment().toISOString()
  };
  attributes.publish = _.defaults(attributes.publish || {}, defaults);
  return attributes;
};

module.exports.postData = postData;
module.exports.publishData = publishData;
module.exports.readPostData = readPostData;
module.exports.writePublishData = writePublishData;
