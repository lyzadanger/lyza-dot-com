'use strict';

var Promise     = require('bluebird');
var fs          = require('fs');
var path        = require('path');

var frontMatter = require('./yaml').getFrontMatter;
var recursive   = Promise.promisify(require('recursive-readdir'));
var yaml        = require('js-yaml');
var _           = require('lodash');

var postContext = require('./post-data');

var config      = require('../config');

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

module.exports.data        = readData;
module.exports.posts       = readPosts;
module.exports.pages       = readPages;
module.exports.sortedPosts = readPosts;
