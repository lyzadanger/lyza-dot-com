'use strict';
/**
 * Putting together context for templates, including metadata about
 * posts and pages.
 */

var config    = require('../config').blog;
var path      = require('path');

var postContext = require('./context-posts');

/**
 * Given a file's path and front matter, can we determine what type of content
 * this is?
 */
var localContext = function (filePath, attributes) {
  /**
   * TODO This is provisional code. If the whole content-type
   * thing becomes broader than posts vs. pages, this whole
   * system should be generalized.
   */
  var fullPostPath   = path.resolve(config.postDir);
  if (filePath.indexOf(fullPostPath) !== -1) {
    attributes = postContext(attributes);
    attributes.isPost = true;
    attributes.contentType = 'post';
    return attributes;
  } else {
    // TODO extend when needed
    attributes.isPage = true;
    attributes.contentType = 'page';
    return attributes;
  }
};

module.exports.local = localContext;
