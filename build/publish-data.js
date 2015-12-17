/**
 * Read and write post frontMatter metaData during publish and unpublish
 * processes.
 *
 * @TODO config should be passed, not required
 * @TODO consolidate defaults with other utils
 */
'use strict';

var config      = require('./config').blog;
var yamlUtil    = require('./utils/yaml');
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
    title   : path.basename(file.path, path.extname(file.path)),
    status  : 'draft',
    template: 'post'
  };
  var attributes = _.defaults(content.attributes || {}, defaults);
  return attributes;
};

/**
 * Process, and extend YAML front matter
 * in post to record needed publish data. This function is used
 * during the publishing process (promotion).
 */
var writePublishData = function writePublishData(file) {
  var attributes = readPostData(file),
    defaults = {
      slug: slug(attributes.title.toLowerCase()),
      date: moment().toISOString()
    };
  attributes.publish = _.defaults(attributes.publish || {}, defaults);
  attributes.publish.path = attributes.publish.path || buildPublishPath(attributes.publish);
  yamlUtil.extend(file, { publish: attributes.publish });
  return attributes;
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

module.exports.readPostData = readPostData;
module.exports.writePublishData = writePublishData;
module.exports.buildPublishPath = buildPublishPath;
