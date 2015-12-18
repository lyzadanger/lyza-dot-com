/* eslint camelcase: 0 */
'use strict';

var fs       = require('fs-extra');
var marked   = require('marked');
var mkdirp   = require('mkdirp');
var moment   = require('moment');
var path     = require('path');
var RSS      = require('rss');
var _        = require('lodash');

var config   = require('./config');
var postData = require('./template-data').sortedPosts;

var formatRFC822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ',// Required by RSS
  feeds = {};

var feedInfo = {
  description   : config.blog.description,
  site_url      : config.blog.domain,
  language      : config.blog.language,
  pubDate       : moment().format(formatRFC822),
  managingEditor: config.blog.author,
  webMaster     : config.blog.author
};

/**
 * Return the RSS feed object for `tag`;
 * create the feed if it doesn't exist
 */
var getTagFeed = function (tag) {
  var tagRSSInfo;
  if (!feeds[tag]) {
    tagRSSInfo = _.extend({}, feedInfo, {
      title: config.blog.title + ': ' + tag,
      feed_url: config.blog.domain + '/feeds/' + tag + '.xml'
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
    url        : config.blog.domain + post.url,
    date       : post.datePublished.toDate(),
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

  marked.setOptions(config.marked);
  // Create the "main" feed for all posts
  var allRSSInfo = _.extend({}, feedInfo, {
    title: config.blog.title + ': everything',
    feed_url: config.blog.domain + '/feeds/rss.rss'
  });

  feeds.rss = new RSS(allRSSInfo);

  postData(config.blog).then(function (posts) {
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

    queue = Object.keys(feeds).length * 2;

    mkdirp(path.resolve(config.blog.feedDir), function (err) {
      if (err) { throw new Error(err); }
      for (var feed in feeds) {
        fs.writeFile(path.resolve(config.blog.feedDir + '/' + feed + '.rss'),
          feeds[feed].xml(),
          dequeue
        );
        // Generate feedburner feeds
        fs.writeFile(path.resolve(config.blog.feedDir + '/' + feed + '-fb.rss'),
          feeds[feed].xml(),
          dequeue
        );
      }
    });
  }, function (err) { throw new Error(err); });
};

module.exports = generateFeeds;
