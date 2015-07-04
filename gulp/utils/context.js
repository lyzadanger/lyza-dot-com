'use strict';

var fs        = require('fs');
var path      = require('path');
var recursive = require('recursive-readdir');
var frontMatter = require('front-matter');
var moment    = require('moment');
var _         = require('lodash');

var blogContext = function (cb) {
  var posts = {},
      sortedPosts = [];
  recursive('./src/content/posts', function (err, files) {
    files.forEach(function(file) {
      if (path.extname(file) === '.md') {
        var contents = fs.readFileSync(path.resolve(file), 'utf8');
        var fm = frontMatter(contents);
        if (fm && fm.attributes) {
          var date = (fm.attributes.publish) ? fm.attributes.publish.date : moment().toISOString();
          posts[date] = fm.attributes;
        }
      }
    });
    // Sort by date, DESC
    _.keys(posts).sort().reverse().forEach(function(date) {
      sortedPosts.push(posts[date]);
    });
    cb({'posts': sortedPosts});
  });
};

var pageContext = function (cb) {
  var pages = [];
  recursive('./src/content/pages', function (err, files) {
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
