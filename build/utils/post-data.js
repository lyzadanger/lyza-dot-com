/**
 * From attributes, build context for a post
 * @TODO consolidate defaults
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

var webifyAttributes = function (attributes) {
  // Run certain attributes through marked
  marked.setOptions(markedConfig);
  ['blurb'].forEach(function (mdAttr) {
    attributes[mdAttr] = attributes[mdAttr] && marked(attributes[mdAttr]);
  });
  // Do some typography enchancements
  attributes.title = attributes.title && typogr.smartypants(attributes.title);
  attributes.blurb = attributes.blurb && typogr.typogrify(attributes.blurb);
  return attributes;
};

module.exports = function (attributes) {
  attributes = _.defaults(attributes || {}, defaults);
  attributes.url = getURL(attributes);
  attributes = webifyAttributes(attributes);
  attributes.datePublished = getPubDate(attributes);
  attributes.datePublishedISO = attributes.datePublished && attributes.datePublished.toISOString();
  return attributes;
};
