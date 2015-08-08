/**
 * From attributes, build context for a post
 */
'use strict';

var config       = require('../config').blog;
var marked       = require('marked');
var markedConfig = require('../config').marked;
var moment       = require('moment');
var _            = require('lodash');
var typogr       = require('typogr');

var defaults = {
  template: 'post'
};

var getURL = function getURL(attributes) {
  var pubPath = attributes.publish && attributes.publish.path,
    url;
  if (pubPath) {
    url = config.urlBase + pubPath.replace(
      config.postFileName + config.postExtension, '');
  }
   return url;
};

var getPubDate = function getPubDate (attributes) {
  var pubDate = attributes.publish && attributes.publish.date,
    momentDate;
  if (pubDate) {
    if (!moment.isMoment(pubDate) && typeof pubDate === 'string') {
      momentDate = moment(pubDate);
      return momentDate.isValid() && momentDate;
    }
  }
};

/**
 * Make the typography in some attributes better for the web
 */
var typographyAttributes = function typographyAttributes (attributes) {
  ['title', 'blurb'].forEach(function (typeAttr) {
    attributes[typeAttr] = attributes[typeAttr] && typogr.typogrify(attributes[typeAttr]);
  });
  return attributes;
};

/**
 * Run some attributes through marked
 */
var mdAttributes = function mdAttributes (attributes) {
  marked.setOptions(markedConfig);
  ['blurb'].forEach(function (mdAttr) {
    attributes[mdAttr] = attributes[mdAttr] && marked(attributes[mdAttr]);
  });
  return attributes;
};

module.exports = function (attributes) {
  attributes = _.defaults(attributes || {}, defaults);
  attributes.url = getURL(attributes);
  attributes = typographyAttributes(attributes);
  attributes = mdAttributes(attributes);
  attributes.datePublished = getPubDate(attributes);
  attributes.datePublishedISO = attributes.datePublished && attributes.datePublished.toISOString();
  return attributes;
};
