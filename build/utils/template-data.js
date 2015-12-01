'use strict';

var Promise     = require('bluebird');
var recursive   = Promise.promisify(require('recursive-readdir'));
var fs          = require('fs');
var path        = require('path');
var yaml        = require('js-yaml');
var _           = require('lodash');
var frontMatter = require('front-matter');

var postContext = require('../utils/context-posts');

var getFrontMatter = function (filePath) {
  var contents = fs.readFileSync(path.resolve(filePath), 'utf8');
  var fm = frontMatter(contents);
  if (fm && fm.attributes) {
    fm.attributes.source = fm.body;
  }
  return (fm && fm.attributes) || {};
};

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
      .then((files) => {
        files.forEach((file) => {
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
      .then((files) => {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== opts.postExtension);
        });
        files.forEach((post) => {
          var attributes = getFrontMatter(post),
            metaData     = postContext(attributes);
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
      .then((files) => {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== opts.postExtension);
        });
        files.forEach((file) => data.push(getFrontMatter(file)));
        resolve(data);
      });
  });
};

module.exports.data = readData;
module.exports.posts = readPosts;
module.exports.pages = readPages;
module.exports.sortedPosts = readPosts;
