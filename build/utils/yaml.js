/* global Buffer */
/**
 * Utilities for munging YAML
 */
'use strict';

var frontMatter = require('front-matter');
var fs          = require('fs-extra');
var path        = require('path');
var YAML        = require('js-yaml');
var _           = require('lodash');


var getFrontMatter = function (filePath) {
  var contents = fs.readFileSync(path.resolve(filePath), 'utf8');
  var fm = frontMatter(contents);
  if (fm && fm.attributes) {
    fm.attributes.source = fm.body;
  }
  return (fm && fm.attributes) || {};
};

/**
 * Extend the existing YAML attributes in the
 * front matter on file with obj. Then replace
 * the YAML string in the file.contents.
 */
var extendYAML = function(file, obj) {
  var content = frontMatter(String(file.contents));
  content.attributes = _.extend(content.attributes, obj);
  replaceYAML(file, content.attributes);
};

/**
 * Replace ALL YAML front matter in the file with the yaml
 * object provided.
 */
var replaceYAML = function(file, obj) {
  var content    = frontMatter(String(file.contents));
  var yamlString = YAML.safeDump(obj);

  // Poor man's wrap
  yamlString     = '---\n' + yamlString + '\n---\n';
  file.contents  = new Buffer(yamlString + content.body);
};

module.exports.extend = extendYAML;
module.exports.getFrontMatter = getFrontMatter;
