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
},

formatDate = function(date, format) {
  var theDate = getMoment(date);
  return theDate && theDate.format(format);
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
  'posts': function (options) {
    var count = parseInt(options.hash.count, 10) || 1,
      offset = parseInt(options.hash.offset, 10) || 0,
      ret = '';
    if (this.posts) {
      for (var i = offset; i < (count + offset); i++) {
        if (this.posts[i]) {
          var compiled = options.fn(this.posts[i]);
          ret = ret + compiled;
        }
      }

    }
    return ret;
  }
};
