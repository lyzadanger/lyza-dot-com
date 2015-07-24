'use strict';

var requireDir = require('require-dir');

// Require all tasks in build/tasks, including subfolders
requireDir('./build/tasks', { recurse: true });
