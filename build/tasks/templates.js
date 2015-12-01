'use strict';

var gulp        = require('gulp');

var config      = require('../config').template;
var blogConfig  = require('../config').blog;
var helpers     = require('../utils/helpers');

var postContext = require('../utils/context-posts');

var Handlebars  = require('handlebars');
var Promise     = require('bluebird');
var frontMatter = require('front-matter');
var fs          = require('fs');
var path        = require('path');
var yaml        = require('js-yaml');
var _           = require('lodash');

var recursive   = Promise.promisify(require('recursive-readdir'));

/** PREP HANDLEBARS **/
var registerHelpers = function () {
  for (var helperKey in helpers) {
    Handlebars.registerHelper(helperKey, helpers[helperKey]);
  }
};

var registerPartial = function (file) {
  var pathBase = path.relative(config.partialDir, path.dirname(file)),
    pathElements = (pathBase !== '') ? [pathBase] : [],
    partialKey;
  pathElements.push(path.basename(file, '.hbs'));
  partialKey = pathElements.join(path.sep);
  Handlebars.registerPartial(partialKey, fs.readFileSync(file, 'utf8'));
};

var registerPartials = function () {
  return new Promise (function (resolve) {
    recursive(config.partialDir)
      .then((files) => {
        files.forEach(registerPartial);
        resolve();
      });
  });
};

/** PREP (SHARED) DATA CONTEXT **/

var readData = function () {
  return new Promise(function (resolve) {
    var data = {};
    recursive(blogConfig.dataDir)
      .then((files) => {
        files.forEach((file) => {
          var key = path.basename(file, path.extname(file));
          data[key] = yaml.safeLoad(fs.readFileSync(file));
        });
        resolve(data);
      });
  });
};

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

var readPosts = function () {
  var data = [];
  return new Promise(function (resolve) {
    recursive(blogConfig.postDir)
      .then((files) => {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== blogConfig.postExtension);
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

var readPages = function () {
  var data = [];
  return new Promise(function (resolve) {
    recursive(blogConfig.pageDir)
      .then((files) => {
        files = _.reject(files, function(file) {
          return (path.extname(file) !== blogConfig.postExtension);
        });
        files.forEach((file) => data.push(getFrontMatter(file)));
        resolve(data);
      });
  });
};

/** NOW, LOCAL CONTEXT **/

gulp.task('templates', function () {
  registerHelpers();
  var prepDone = Promise.all([readData(), readPosts(), readPages(), registerPartials()]);
  var context;
  prepDone.then(function (values) {
    context = {
      data: values[0],
      posts: values[1],
      pages: values[2]
    };
  });

});
