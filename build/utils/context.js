'use strict';
/**
 * Putting together context for templates, including metadata about
 * posts and pages.
 */

var config    = require('../config').blog;
var fs        = require('fs');
var path      = require('path');
var recursive = require('recursive-readdir');
var frontMatter = require('front-matter');
var moment    = require('moment');
var _         = require('lodash');

var postContext = require('./context-posts');

var getFrontMatter = function (filePath) {
  var contents = fs.readFileSync(path.resolve(filePath), 'utf8');
  var fm = frontMatter(contents);
  return (fm && fm.attributes) || {};
};

var getSortedPosts = function(files) {
  var posts = {},
    sortedPosts = [];

  files = _.reject(files, function(file) {
    return (path.extname(file) !== config.postExtension);
  });

  files.forEach(function(file) {
    var attributes = getFrontMatter(file),
      metaData = postContext(attributes);
    if (metaData) {
      posts[metaData.datePublishedISO] = metaData;
    }
  });
  // Sort the keys of posts (which are dates), then reverse 'em
  // so we get posts sorted by reverse chronology
  _.keys(posts).sort().reverse().forEach(function(date) {
    sortedPosts.push(posts[date]);
  });
  return sortedPosts;
};

var blogContext = function (cb) {
  var posts = {},
      sortedPosts = [];
  // TODO Cleanup config stuff and break out context futzing
  recursive(config.postDir, function (err, files) {
    var posts = getSortedPosts(files);
    cb({'posts': posts});
  });
};

var pageContext = function (cb) {
  var pages = [];
  recursive(config.pageDir, function (err, files) {
    files.forEach(function(file) {
      // NOTE Use context-pages if we need to do anything with these attrs
      pages.push(getFrontMatter(file));
    });
    cb({'pages': pages});
  });
};

var sharedContext = function(done) {
  var context = {},
    contextQueue = {
      'posts' : blogContext,
      'pages' : pageContext
    },
    queued = Object.keys(contextQueue).length;

  var dequeueCallback = function(additionalContext) {
    _.extend(context, additionalContext);
    queued--;
    if (!queued) {
      done(context);
    }
  };

  for (var contextMethod in contextQueue) {
    contextQueue[contextMethod](dequeueCallback);
  }
};

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
  var fullPagePath = path.resolve(config.pageDir),
    fullPostPath   = path.resolve(config.postDir);
  if (filePath.indexOf(fullPostPath) !== -1) {
    return postContext(attributes);
  } else {
    // TODO extend when needed
    return attributes;
  }
};

module.exports.shared = sharedContext;
module.exports.local = localContext;
