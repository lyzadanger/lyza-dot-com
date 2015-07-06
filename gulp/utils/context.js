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
      metaData = postData(fm.attributes);
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
  var context = {};
  var contextQueue = {
    'posts' : blogContext,
    'pages' : pageContext
  };
  var queued = Object.keys(contextQueue).length;
  var dequeue = function(result) {
    _.extend(context, result);
    queued--;
    if (!queued) {
      done(context);
    }
  };
  for (var key in contextQueue) {
    contextQueue[key](dequeue);
  }
};

module.exports = sharedContext;
