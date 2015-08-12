/**
 * Exports an object of Handlebars helpers
 * intended for SSR needs.
 */
'use strict';

var _            = require('lodash');
var config       = require('../config').blog;
var marked       = require('marked');
var markedConfig = require('../config').marked;
var Handlebars   = require('handlebars');
var moment       = require('moment');

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
        posts.push(_.clone(allPosts[i]));
      }
    }
  }
  return posts;
};

module.exports = {
  'formatDate': function (date, options) {
    var formatted, format;
    format = options.hash.format || config.dateDisplayFormat;
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
  'markdown': function (content) {
    marked.setOptions(markedConfig);
    return marked(content);
  },
  'postCount': function (options) {
    var posts = getPosts(options, this.posts);
    return posts.length || 0;
  },
  'posts': function (options) {
    var ret = '',
      posts = getPosts(options, this.posts);

    posts.forEach(function (post) {
      ret = ret + options.fn(post);
    });

    return ret;
  }
};
