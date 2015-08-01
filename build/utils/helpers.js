/**
 * Exports an object of Handlebars helpers
 * intended for SSR needs.
 */
'use strict';

var _          = require('lodash');
var config     = require('../config').blog;
var Handlebars = require('handlebars');
var moment     = require('moment');

var getMoment = function (date) {
  var convertedDate;
  if (moment.isMoment(date)) {
    return date;
  } else if (typeof date === 'string') {
    convertedDate = moment(date);
    return convertedDate.isValid() && convertedDate;
  }
  return false;
};

var formatDate = function(date, format) {
  var theDate = getMoment(date);
  return theDate && theDate.format(format);
};

var getPosts = function (options, allPosts) {
  var count = parseInt(options.hash.count, 10) || (allPosts && allPosts.length),
    offset = parseInt(options.hash.offset, 10) || 0,
    posts = [];
  if (allPosts && allPosts.length) {
    for(var i = offset; i < (count + offset); i++) {
      if (allPosts[i]) {
        posts.push(allPosts[i]);
      }
    }
  }
  return posts;
};

module.exports = {
  'formatDate': function (date, options) {
    var formatted, format;
    format = options.format || config.dateDisplayFormat;
    formatted = formatDate(date, format);
    if (formatted) {
      return new Handlebars.SafeString(formatted);
    }
  },
  'isoDate': function (date) {
    var theDate = getMoment(date);
    if (theDate) {
      return theDate.toISOString();
    }
  },
  'gridPosts': function (options) {
    var ret = '',
      posts = getPosts(options, this.posts);
    // If the _second_ post has a thumbnail...
    if (posts.length && posts[1]) {
      posts[0].gridWidth = 'u-lg-size8of12';
      posts[1].gridWidth = 'u-md-size1of2 u-lg-size4of12';
      posts[0].wideGrid = true;
      posts[1].wideGrid = false;

      if (posts[0].thumbnail && posts[1].thumbnail) {
        posts[0].gridWidth = 'u-lg-size6of12';
        posts[1].gridWidth = 'u-lg-size6of12';
        posts[1].wideGrid = true;
      } else if (posts[1].thumbnail) {
        posts[0].gridWidth = 'u-lg-size4of12';
        posts[1].gridWidth = 'u-lg-size8of12';
        posts[0].wideGrid = false;
        posts[1].wideGrid = true;
      }
    }

    if (posts.length > 2) {
      for (var i = 2; i < posts.length; i++) {
        posts[i].wideGrid = false;
        posts[i].gridWidth = 'u-md-size1of2 u-lg-size1of3';
      }
    }
    posts.forEach(function (post) {
      ret = ret + options.fn(post);
    });
    return ret;
  },
  'posts': function (options) {
    var ret = '',
      posts = getPosts(options, this.posts);

    posts.forEach(function (post) {
      ret = ret + options.fn(post);
    });

    return ret;
  },
  'postThumbnail': function (options) {
    console.log(this);
  }
};
