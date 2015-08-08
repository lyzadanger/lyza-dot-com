/* jshint camelcase: false */
'use strict';

var RSS = require('rss');
var moment = require('moment');
var config = require('../config');
var fs     = require('fs');
var marked = require('marked');
var mkdirp = require('mkdirp');
var path   = require('path');
var postData = require('./blog-data').sortedPosts;
var _     = require('lodash');

var formatRFC822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ',// Required by RSS
  markedConfig = config.marked,
  rssConfig = config.blog,
  feeds = {},
  feedInfo;

var feedInfo = {
  description   : rssConfig.description,
  site_url      : rssConfig.domain,
  language      : rssConfig.language,
  pubDate       : moment().format(formatRFC822),
  managingEditor: rssConfig.author,
  webMaster     : rssConfig.author
};

/**
 * Return the RSS feed object for `tag`;
 * create the feed if it doesn't exist
 */
var getTagFeed = function (tag) {
  var tagRSS,
    tagRSSInfo;
  if (!feeds[tag]) {
    tagRSSInfo = _.extend({}, feedInfo, {
      title: rssConfig.title + ': ' + tag,
      feed_url: rssConfig.domain + '/feeds/' + tag + '.xml'
    });
    feeds[tag] = new RSS(tagRSSInfo);
  }
  return feeds[tag];
};

/**
 * Add an item to the main feed and all appropriate
 * tag feeds.
 */
var addItem = function (post) {
  var postRSSInfo = {
    title      : post.title,
    description: marked(post.source),
    url        : rssConfig.domain + post.url,
    date       : post.datePublished.format(formatRFC822),
    categories : post.tags
  };
  feeds.rss.item(postRSSInfo);
  // Add to each tag feed
  if (post.tags && post.tags.length) {
    post.tags.forEach(function (tag) {
      var tagFeed = getTagFeed(tag);
      tagFeed.item(postRSSInfo);
    });
  }
};

var generateFeeds = function (cb) {

  marked.setOptions(markedConfig);
  // Create the "main" feed for all posts
  var allRSSInfo = _.extend({}, feedInfo, {
    title: rssConfig.title + ': everything',
    feed_url: rssConfig.domain + '/feeds/rss.xml'
  });

  feeds.rss = new RSS(allRSSInfo);

  postData(function (posts) {
    var queue;
    // Callback for writeFile
    var dequeue = function (err) {
      if (err) { throw new Error(err); }
      queue--;
      if (queue <= 0) {
        cb(); // DONE
      }
    };

    posts.forEach(addItem);

    queue = Object.keys(feeds).length;

    mkdirp(path.resolve(rssConfig.feedDir), function (err) {
      if (err) { throw new Error(err); }
      for (var feed in feeds) {
        fs.writeFile(path.resolve(rssConfig.feedDir + '/' + feed + '.xml'),
          feeds[feed].xml(),
          dequeue
        );
      }
    });
  }, function (err) { throw new Error(err); });
};

module.exports = generateFeeds;
