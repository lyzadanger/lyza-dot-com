'use strict';
var dest = './build';
var src  = './src';

module.exports = {
  browserSync: {
    server: {
      baseDir: dest
    }
  },
  css: {
    importDir: src + '/styles',
    src: src + '/styles/styles.css',
    dest: dest + '/css'
  },
  protoHTML: {
    src: src + '/proto/**/*.md',
    dest: dest
  },
  template: {
    templateDir: src + '/templates'
  }
};
