'use strict';
/**
 * Putting together context for templates, including metadata about
 * posts and pages.
 */

var config    = require('../config').blog;
var fs        = require('fs');
var path      = require('path');
var postData  = require('./blog').allPostData;
var pubDate   = require('./blog').getPublishDate;
var recursive = require('recursive-readdir');
var frontMatter = require('front-matter');
var moment    = require('moment');
var _         = require('lodash');

var getPostURL = function getPostURL(attributes) {
   var path = attributes.publish.path.replace(
     config.postFileName + config.postExtension, '');
   path = config.urlBase + path;
   attributes.url = path;
   return attributes;
};

/**
 * Do any additional processing of the attributes
 * object that we get back from the blog utils. Do
 * things relevant to template contexts...
 */
var buildPostContext = function(attributes) {
  attributes = postData(attributes);
  attributes = getPostURL(attributes);
  return attributes;
};

var getSortedPosts = function(files) {
  var posts = {},
    sortedPosts = [];

  files = _.reject(files, function(file) {
    return (path.extname(file) !== config.postExtension);
  });

  files.forEach(function(file) {
    var contents, fm, metaData;
    contents = fs.readFileSync(path.resolve(file), 'utf8');
    fm       = frontMatter(contents);
    if (fm && fm.attributes) {
      metaData = buildPostContext(fm.attributes);
      posts[pubDate(metaData)] = metaData;
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
      var contents = fs.readFileSync(path.resolve(file), 'utf8');
      var fm = frontMatter(contents);
      if (fm && fm.attributes) {
        pages.push(fm.attributes);
      }
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

module.exports = sharedContext;
