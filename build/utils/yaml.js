/* global Buffer */
/**
 * Utilities for munging YAML
 */
'use strict';

var frontMatter = require('front-matter');
var YAML        = require('js-yaml');
var _           = require('lodash');

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
