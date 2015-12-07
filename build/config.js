'use strict';
var highlight = require('highlight.js');

var dest = './dist',
  src  = './src',
  dirs = {
    data: src + '/data',
    drafts: src + '/content/drafts',
    js: src + '/javascript',
    pages: src + '/content/pages',
    posts: src + '/content/posts',
    scripts: src + '/javascript',
    styles: src + '/styles',
    templates: src + '/templates'
  },
  srcs = {
    drafts: dirs.drafts + '/*/**/*.md',
    js: dirs.js + '/**/*.js',
    pages: dirs.pages + '/**/*.md',
    posts: dirs.posts + '/**/*.md',
    styles: dirs.styles + '/styles.css',
    templates: dirs.templates + '/**/*.hbs'
  };

module.exports = {
  assets: {
    // Everything in pages/* and posts/*
    // but NOT markdown files
    src: [ dirs.pages + '/**/*',
           '!' + srcs.pages,
           dirs.posts + '/**/*.*',
           '!' + srcs.posts
         ],
    dest: dest
  },
  blog: {
    author: 'Lyza Danger Gardner',
    dataDir: dirs.data,
    dateDisplayFormat: 'MMMM D, YYYY', // http://momentjs.com/docs/#/displaying/
    description: 'Developer and Person',
    domain: 'http://www.lyza.com',
    feedDir: dest + '/feeds/',
    language: 'en-US',
    permalinkPattern: 'YYYY/MM/DD',
    postFileName: 'index',
    postExtension: '.md',
    pageDir: dirs.pages,
    postDir: dirs.posts,
    title: 'Lyza Danger Gardner',
    urlBase: '/'
  },
  browserSync: {
    open: false,
    server: {
      baseDir: dest
    }
  },
  clean: {
    out: dest
  },
  css: {
    importDir: dirs.styles,
    src: srcs.styles,
    dest: dest + '/css'
  },
  content: {
    src: [ srcs.pages, srcs.posts ],
    dest: dest
  },
  js: {
    webpack: {
      entry: dirs.js + '/site.js',
      output: {
        filename: dest + '/js/site.js'
      }
    },
    src: srcs.js
  },
  marked: { // Shared by several tasks
    gfm: true,
    highlight: function(code) {
      return highlight.highlightAuto(code).value;
    },
    smartypants: true
  },
  markedLite: {
    gfm: true,
    smartypants: true
  },
  publish: {
    dest: dirs.posts,
    drafts: dirs.drafts,
    prune: dirs.drafts,
    src: srcs.drafts
  },
  unpublish: {
    src: srcs.posts,
    prune: dirs.posts,
    dest: dirs.drafts
  },
  templates: {
    partialDir: dirs.templates + '/partials',
    templateDir: dirs.templates,
    src : srcs.templates
  }
};
