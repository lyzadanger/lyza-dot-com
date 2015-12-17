'use strict';
/**
 * To build the pages on the site, we compile content (pages, posts) against
 * templates. There are two types of context given to a template when it
 * renders.
 *
 * One is a "shared context"—that's a single context we give to
 * all templates on the site. This file is concerned with generating that.
 *
 * This second kind of context is a "local context", a context object generated
 * individually for each piece of content (as identified by its filePath).
 * @see template-data-local for that
 *
 */
var Promise     = require('bluebird');
var fs          = require('fs');
var path        = require('path');

var frontMatter = require('./yaml').getFrontMatter;
var recursive   = Promise.promisify(require('recursive-readdir'));
var yaml        = require('js-yaml');
var _           = require('lodash');

var postContext = require('./post-data');

var config      = require('../config');

/**
 * Sort posts by date published, reversed.
 * Utility function.
 *
 * @param posts {Array} of {Objects}    Each object representing a post's data
 * @return {Array}                      Sorted
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
 * Read in data from YAML files in the data directory.
 * Data is added to the data object keyed by each data file's basename.
 * This is intended to be part of the shared context for compiling content.
 *
 * @param opts {object}             blog configuration object
 * @return {Promise}                resolves to data object, keyed by filenames
 */
var readData = function (opts) {
  return new Promise(function (resolve) {
    var data = {};
    recursive(opts.dataDir)
      .then(function (files) {
        files.forEach(function (file) {
          var key = path.basename(file, path.extname(file));
          data[key] = yaml.safeLoad(fs.readFileSync(file));
        });
        resolve(data);
      });
  });
};

/**
 * Parse all posts and build an array of metadata about them. This gives
 * other content on the site information about all the posts for various
 * template needs.
 *
 * @param opts {Object}       blog configuration object
 * @return {Promise}          resolves to array of post metadata
 */
var readPosts = function (opts) {
  var data = [];
  return new Promise(function (resolve) {
    recursive(opts.postDir)
      .then(function (files) {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== opts.postExtension);
        });
        files.forEach(function (post) {
          var attributes = frontMatter(post),
            metaData     = postContext(attributes, config);
          if (metaData) {
            data.push(metaData);
          }
        });
        data = sortPosts(data);
        resolve(data);
      });
  });
};

/**
 * Parse all pages and build an array of metadata about them.
 *
 * @param opts {Object}         blog configuration object
 * @return {Array}              page metadata
 */
var readPages = function (opts) {
  var data = [];
  return new Promise(function (resolve) {
    recursive(opts.pageDir)
      .then(function (files) {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== opts.postExtension);
        });
        files.forEach(function (file) {
          data.push(frontMatter(file));
        });
        resolve(data);
      });
  });
};

var allData = function (opts) {
  return Promise.all([readData(opts),
    readPosts(opts),
    readPages(opts)]).then(function (data) {
      return {
        data: data[0],
        posts: data[1],
        pages: data[2]
      };
    });
};

module.exports.data        = readData;
module.exports.posts       = readPosts;
module.exports.pages       = readPages;
module.exports.all          = allData;
module.exports.sortedPosts = readPosts;
