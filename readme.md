# gulp-jade-modules

[Gulp](http://gulpjs.com/) plugin to fully path [Jade](http://jade-lang.com/) includes and extends. Allows for easy includes of `node_modules` and arbitrary filesystem paths to encourage shared Jade partials between projects.

## Install

`npm install --save-dev gulp-jade-modules`

Recommended to use with [gulp-jade](https://www.npmjs.com/package/gulp-jade) and [gulp-filter](https://www.npmjs.com/package/gulp-filter)

## Usage

`gulpfile.js`
````
var gulp        = require('gulp'),
    jade        = require('gulp-jade'),
    jadeModules = require('gulp-jade-modules'),
    filter      = require('gulp-filter');

gulp.task('template-html', function() {
  return gulp.src('./templates/index.jade')
    .pipe(jadeModules({
      paths: ['../shared/templates/']
    }))
    .pipe(jade({
      basedir: '/'
    }))
    .pipe(filter(['*', '!_*']))
    .pipe(gulp.dest(conf.dist));
});
````

`index.jade`
````
include _header.jade
include @@_overlay.jade
include _footer.jade
````

The `gulp-jade-modules` plugin will attempt to resolve `_header.jade` and `_footer.jade` relative to the parent file, any additional paths, and the project. It will take the most specific path.

It will resolve any include matching `options.flag` to the `node_modules` directory, using [resolve](https://www.npmjs.com/package/resolve). Usage with [gulp-filter](https://www.npmjs.com/package/gulp-filter) is recommended to avoid writing a bunch of Jade partials out as unnecessary HTML snippets.

## Options

### `paths`

Array of paths to attempt to resolve filesystem files in. Useful for shared local directories or git submodules.

Default: `[]`

### `flag`

Flag that occurs before path signaling `node_modules` lookup. With the default flag, `@@my-module/index.jade` would be resolved to the `node_modules` directory.

Default: `@@`

### `extension`

File extension to match dependencies to.

Default: `jade`
