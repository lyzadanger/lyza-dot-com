/**
 * From attributes, build context for a post
 */
'use strict';

var config = require('../config').blog;
var moment = require('moment');

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

module.exports = function (attributes) {
  attributes.url = getURL(attributes);
  attributes.datePublished = getPubDate(attributes);
  attributes.datePublishedISO = attributes.datePublished && attributes.datePublished.toISOString();
  return attributes;
};
