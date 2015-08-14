/* global console */
'use strict';

var minimist = require('minimist');
var chalk    = require('chalk');
var config   = require('../config').publish;
var fs       = require('fs');
var mkdirp   = require('mkdirp');
var path     = require('path');
var slug     = require('slug');
var YAML     = require('js-yaml');
var _        = require('lodash');

var args     = minimist(process.argv.slice(2));

var help = function (command, args) {
  var cmds = [
    { name: 'post', desc: 'Add a new, empty blog post'},
    { name: 'help', desc: 'Get help!'}
  ];
  var options = {
    help: {
      desc: 'Get help!',
      usage: 'lyza <command> [<args>]'
    },
    post: {
      desc: 'Create a new, empty blog post',
      usage: 'lyza post [--title=]<title> [-p|--publish] [--tags=<tags>]',
      args: [
        { name: '<title>', description: 'The title of your post (required). Can also be set with options.'}
      ],
      options: [
        { name: '--title=<title>', description: 'Alternate method to set <title>'},
        { name: '--tags=<tags>', description: 'Post tags (space-separated)'},
        { name: '-p, --publish', description: 'Set this post to be published (draft is default)'}
      ]
    }
  };
  command = (command && options[command]) ? options[command] : commands.help;

  console.log(chalk.yellow('Usage:'), command.usage + '\n');

  if (command.args) {
    console.log(chalk.yellow('Arguments:'));
    command.args.forEach(function (arg) {
      console.log('  ' + arg.name + '\n      ' + arg.description + '\n');
    });
  }
  if (command.options) {
    console.log(chalk.yellow('Options:'));
    command.options.forEach(function (option) {
      console.log('  ' + option.name + '\n      ' + option.description + '\n');
    });
  }
};

var say = {
  info: function (msg) {
    console.log(msg);
  },
  error: function (msg) {
    console.log(chalk.red(msg));
  },
  warning: function (msg) {
    console.log(chalk.yellow(msg));
  },
  success: function (msg) {
    console.log(chalk.green(msg));
  }
};

var fail = function (command, msg, args) {
  help(command, args);
  say.error(msg);
  process.exit(1);
};

var commands = {
  post: function (args) {
    var title = args.title || args._[1],
      fileContent,
      postSlug,
      postData;
    if (!title) {
      fail('post', '<title> required: Hey, I\'m gonna need a title for that post.', args);
    }
    postData = {
      title: title,
      status: (args.p && args.publish) ? 'published' : 'draft',
      tags: (args.tags) ? args.tags.split(' ') : [],
      thumbnail: { }
    };

    postSlug = slug(title, {lower: true });
    fileContent = '---\n' + YAML.safeDump(postData) + '---\n';
    
    fs.stat(config.drafts, function (err, stats) {
      if (err || !stats.isDirectory()) {
        fail('post', 'Cannot find drafts directory. Are you sure you are in the right place?');
      }
      else {
        mkdirp(path.resolve(config.drafts + '/' + postSlug), function (err) {
          if (err) {
            fail('post', 'Problem creating directory for new draft: ' + err);
          }
          fs.writeFile(path.resolve(config.drafts + postSlug) + '/index.md',
            fileContent, function (err) {
              if (err) {
                fail('post', 'Problem writing to new post file: ' + err);
              }
              say.success('New post file created!');
            });
        });
      }
    });
  }
};

var lyza = function () {
  var cmd = args._[0];
  if (cmd && commands[cmd]) {
    commands[cmd](args);
  }
};

module.exports = lyza;
