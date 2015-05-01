'use strict';

var config      = require('../config').blog;
var frontMatter = require('front-matter');
var moment      = require('moment');
var path        = require('path');
var slug        = require('slug');
var _           = require('lodash');

var postData = function postData(file) {
  if (file.data && file.data.dataIsParsed) {
    return file.data;
  }
  var content = frontMatter(String(file.contents));
  var defaults = {
    fileName: 'index.md',
    status  : 'draft',
    template: 'post',
    title   : path.basename(file.path, path.extname(file.path))
  };
  var data = _.defaults(content.attributes, defaults);
  data.slug = data.slug || slug(data.title.toLowerCase());
  data.dataIsParsed = true;
  return data;
};

module.exports.postData = postData;
