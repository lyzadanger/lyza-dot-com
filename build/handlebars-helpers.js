/**
 * Site-relevant Handlebars (template) helpers for
 * formatting, displaying post information, etc.
 *
 * Used by the `content` task and handed to the `handlebars`
 * plugin.
 *
 */
'use strict';

var _            = require('lodash');
var Handlebars   = require('handlebars');
var moment       = require('moment');
var marked       = require('marked');

var config       = require('./config');

/**
 * Utility: Returns a {Moment} object for the date in question.
 * Noop if date is already a {Moment}
 *
 * @param date {String} || {Moment}
 * @return {Moment} || false on failure
 */
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

/**
 * Utility date formatter.
 *
 * @param date {Moment} || {String}
 * @param format {String}            Moment-compatible date format string
 *
 * @return {String} || false on failure
 */
var formatDate = function(date, format) {
  var theDate = getMoment(date);
  return theDate && theDate.format(format);
};

/**
 * Filter an array of posts to match options.
 *
 * Recognized options:
 * - count {Number} default allPost.length  How many posts you want?
 * - offset {Number} default 0              What index to start from
 * - tag {String}                           Filter posts by tag
 *
 * @param options {Object}        filter options (handlebars arguments)
 * @param allPosts {Array}        Array of posts to filter.
 *
 * @return {Array}                Posts from allPosts matching options
 */
var getPosts = function (options, allPosts) {
  var count = parseInt(options.hash.count, 10) || (allPosts && allPosts.length),
    offset = parseInt(options.hash.offset, 10) || 0,
    tag    = options.hash.tag || '',
    posts = [];
  if (tag) {
    allPosts = _.filter(allPosts, function (post) {
      return (_.contains(post.tags, tag) || tag === 'all');
    });
  }
  if (allPosts && allPosts.length) {
    for(var i = offset; i < (count + offset); i++) {
      if (allPosts[i]) {
        posts.push(_.clone(allPosts[i]));
      }
    }
  }
  return posts;
};

/** Helpers **/
module.exports = {
  formatDate: function (date, options) {
    var formatted, format;
    format = options.hash.format || config.blog.dateDisplayFormat;
    formatted = formatDate(date, format);
    if (formatted) {
      return new Handlebars.SafeString(formatted);
    }
  },
  ifEqual: function (left, right, options) {
    if (left === right) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  isoDate: function (date) {
    var theDate = getMoment(date);
    if (theDate) {
      return theDate.toISOString();
    }
  },
  markdown: function (content) {
    marked.setOptions(config.marked);
    return marked(content);
  },
  postCount: function (options) {
    var posts = getPosts(options, this.posts);
    return posts.length || 0;
  },
  postsByMonth: function (options) {
    var posts = getPosts(options, this.posts),
      monthPosts = [],
      currentMonth,
      currentMonthPosts,
      ret = '';
    var monthFormatted = function (date) {
      return getMoment(date).format('MMMM, YYYY');
    };

    var addPost = function (post) {
      var postMonth;
      if (post) {
        postMonth = monthFormatted(post.datePublished);
      }
      if (!post || postMonth !== currentMonth) {
        if (currentMonthPosts) {
          monthPosts.push(currentMonthPosts);
        }
        if (post) {
          currentMonth = postMonth;
          currentMonthPosts = {
            month: currentMonth,
            posts: [post]
          };
        }
      } else {
        currentMonthPosts.posts.push(post);
      }
    };

    if (posts && posts.length) {
      posts.forEach(addPost);
    }
    addPost(null);
    monthPosts.forEach(function (month) {
      ret = ret + options.fn(month);
    });
    return ret;
  },
  posts: function (options) {
    var ret = '',
      posts = getPosts(options, this.posts);

    posts.forEach(function (post) {
      ret = ret + options.fn(post);
    });

    return ret;
  }
};
