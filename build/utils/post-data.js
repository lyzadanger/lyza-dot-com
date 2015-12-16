/**
 * Given an attributes object representing
 * front matter, process and prepare data about
 * a single post for template compilation
 * @TODO consolidate defaults
 */
'use strict';

var marked       = require('marked');
var moment       = require('moment');
var _            = require('lodash');
var typogr       = require('typogr');

var defaults = {
  template: 'post'
};

var postURL = function postURL(attributes, opts) {
  var pubPath = attributes.publish && attributes.publish.path,
    url;
  if (pubPath) {
    url = opts.urlBase + pubPath.replace(
      opts.postFileName + opts.postExtension, '');
  }
  return url;
};

/**
 * Return the publication date for this post as either a moment or
 * ISO string
 *
 * @param attributes {Object}
 * @param format {String}        A value of 'iso' will cause this to return
 *                               a string instead of a moment.
 * @return {Moment} || {String} || {boolean} false on failure
 */
var postPublicationDate = function postPublicationDate(attributes, format) {
  var pubDate = attributes.publish && attributes.publish.date,
    momentDate;
  if (pubDate) {
    if (!moment.isMoment(pubDate) && typeof pubDate === 'string') {
      momentDate = moment(pubDate);
      if (format && format === 'iso') {
        return momentDate.isValid() && momentDate.toISOString();
      }
      return momentDate.isValid() && momentDate;
    }
  }
};

module.exports = function (attributes, opts) {

  attributes = _.defaults(attributes || {}, defaults);

  // Web-ify some attributes

  // Run some attributes through markdown
  marked.setOptions(opts.marked);
  ['blurb'].forEach(function (mdAttr) {
    attributes[mdAttr] = attributes[mdAttr] && marked(attributes[mdAttr]);
  });

  // Do some typography enchancements
  attributes.title = attributes.title && typogr.smartypants(attributes.title);
  attributes.blurb = attributes.blurb && typogr.typogrify(attributes.blurb);

  attributes.url = postURL(attributes, opts.blog);
  attributes.datePublished = postPublicationDate(attributes, 'moment');
  attributes.datePublishedISO = postPublicationDate(attributes, 'iso');
  return attributes;
};
