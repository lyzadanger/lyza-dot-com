'use strict';

var gulp        = require('gulp');

var config      = require('../config').template;
var blogConfig  = require('../config').blog;
var helpers     = require('../utils/helpers');

var postContext = require('../utils/context-posts');

// var Handlebars  = require('handlebars');
var Promise     = require('bluebird');
var frontMatter = require('front-matter');
var fs          = require('fs');
var path        = require('path');
var yaml        = require('js-yaml');
var _           = require('lodash');

var data        = require('gulp-data');
var markdown    = require('gulp-markdown');

var recursive   = Promise.promisify(require('recursive-readdir'));

var template    = require('../plugins/handlebars');

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

gulp.task('templates', function (done) {
  var prepDone = Promise.all([readData(), readPosts(), readPages()]);
  prepDone.then(function (values) {
    let context = {
      data: values[0],
      posts: values[1],
      pages: values[2]
    };
    
    gulp.src(config.src)
      .pipe(data(function(file) {
        var content = frontMatter(String(file.contents));
        // Replace file's contents with just the body
        // of the current contents (sans front matter)
        file.contents = new Buffer(content.body);
        return content.attributes;
      }))
      .pipe(markdown({
        highlight: function(code) {
          return require('highlight.js').highlightAuto(code).value;
        },
        gfm: true,
        smartypants: true
      }))
      .pipe(template({
        partialDir: 'src/templates/partials',
        templateDir: 'src/templates',
        helpers: helpers,
        context: context
      }))
      .on('finish', function () {
        console.log('all through');
        done();
      });
  });
});
