/**
 * Get data/metadata from post and page files
 */
'use strict';

var frontMatter = require('front-matter');
var fs          = require('fs');
var path        = require('path');
var _           = require('lodash');
var config      = require('../config').blog;
var recursive   = require('recursive-readdir');
var yaml        = require('js-yaml');

var postContext = require('./context-posts');

var getFrontMatter = function (filePath) {
  var contents = fs.readFileSync(path.resolve(filePath), 'utf8');
  var fm = frontMatter(contents);
  if (fm && fm.attributes) {
    fm.attributes.source = fm.body;
  }
  return (fm && fm.attributes) || {};
};

/**
 * Take unsorted array of posts and sort it by date published, DESC
 */
var sortPosts = function(posts) {
  var dates = [],
    sorted = [];

  dates = _.pluck(posts, 'datePublishedISO');
  dates = dates.sort();
  dates = dates.reverse();
  dates.forEach(function(date) {
    sorted.push(_.findWhere(posts, { datePublishedISO: date }));
  });
  return sorted;
};

/**
 * Read YAML data out of data files
 */
var dataData = function (win, fail) {
  var data = {};
  recursive(config.dataDir, function (err, files) {
    if (err) { fail(err); }
    else {
      files.forEach(function (file) {
        var key = path.basename(file, path.extname(file));
        data[key] = yaml.safeLoad(fs.readFileSync(file));
      });
    }
    win(data);
  });
};

var pageData = function (win, fail) {
  var pages = [];
  recursive(config.pageDir, function (err, files) {
    if (err) { fail(err); }
    else {
      files.forEach(function (file) {
        // NOTE Use context-pages if we need to do anything with these attrs
        pages.push(getFrontMatter(file));
      });
      win(pages);
    }
  });
};

/**
 * Return Array of metadata about all blog posts
 */
var postData = function (win, fail) {
  var posts = [];

  recursive(config.postDir, function (err, files) {
    if (err) {
      fail(err);
    } else {
      files = _.reject(files, function(file) {
        return (path.extname(file) !== config.postExtension);
      });

      files.forEach(function(file) {
        var attributes = getFrontMatter(file),
          metaData = postContext(attributes);
        if (metaData) {
          posts.push(metaData);
        }
      });
      win(posts);
    }
  });
};

var sortedPostData = function (win, fail) {
  postData(function (posts) {
    win(sortPosts(posts));
  }, function (err) {
    fail(err);
  });
};

module.exports.data  = dataData;
module.exports.posts = postData;
module.exports.pages = pageData;
module.exports.sortedPosts = sortedPostData;
