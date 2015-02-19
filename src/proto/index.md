
## Set up Environment

### Repo

```shell
$ npm init
$ echo 'node_modules' >> .gitignore
$ git init
$ git add package.json .gitignore
$ git commit -m "Initial commit"

```

### Gulp fundamentals

```shell
$ npm install --save-dev gulp require-dir
$ echo "'use strict';" >> gulpfile.js
$ mkdir gulp/tasks
$ git add gulpfile.js
$ git commit -m "Gulp fundamentals"
```

### Environment

* Added .jshintrc, .jscs, .editorconfig

```shell
$ git add .jshintrc .jscs .editorconfig
$ git commit -m "OCD amount of .config"
```

### Creating an area for prototyping

```shell
$ mkdir source/proto
$ touch source/proto/index.md
```

* Add some basic markdown content to `index.md`

```shell
$ git add source/proto/index.md
$ git commit -m "Proto directory and simple index markdown file"
```

### First Task(s) bones

* Establishing `gulpfile.js`: (inspired by [https://github.com/greypants/gulp-starter](https://github.com/greypants/gulp-starter) )

```shell
$ touch gulp/config.js
$ echo "'use strict';" >> gulp/tasks/pages-html.js
```

* Edit `config.js` to have a skeletal structure


```shell
$ git add gulp/config.js gulp/tasks/pages-html.js
$ git commit -m "Basic structure for first markdown/html task and gulp config"
```

### On second thought...

```shell
$ git mv gulp/tasks/pages-html.js gulp/tasks/proto-html.js
$ git commit -am "Rename pages-html -> proto-html because it makes more sense"
```

### On third thought...

* add `build` to `.gitignore`

```shell
$ git commit -am "Adding output build for now to .gitignore"
```

### Setting up prototype pages

```shell
$ npm install --save-dev gulp-markdown gulp-rename
```

* Edit `proto-html.js` task (marked, rename)
* Add required config to `gulp/config.js`

```shell
$ git commit -am "proto-html task to convert markdown, rename"
```

### Our first template/plugin

* `$  mkdir src/templates`
* `$ npm install --save-dev gulp-util through2`
* [gist base for first plugin](https://gist.github.com/lyzadanger/ef133432adfd30b7c9eb)

### git history rewrite

```shell
$ git stash
```

* Make edits to `index.md`

```shell
$ git add src/proto/index.md
$ git commit --amend
```
