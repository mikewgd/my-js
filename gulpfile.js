'use strict';

const gulp = require('gulp');
const util = require('gulp-util');
const sass = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat-multi');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const sassGlob = require('gulp-sass-bulk-import');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');
const jshint = require('gulp-jshint');
const jsdoc = require('gulp-jsdoc3');
const jsdocConfig = require('./jsDocConfig.json');

const paths = {
  src: {
    root: '_source',
  },

  dist: {
    root: 'assets',
  },

  init: function() {
    let jsRawPath = `${this.src.root}/js/raw`;
    let jsGlobalPath = `${this.src.root}/js/globals.js`;

    this.src.sass = `${this.src.root}/scss/**/*.scss`;
    this.src.javascript = `${this.src.root}/js/**/*.js`,

    this.src.components = {
      'global.js': jsGlobalPath,
      'carousel.js': [jsGlobalPath, `${jsRawPath}/carousel.js`],
      'input.js': [jsGlobalPath, `${jsRawPath}/input.js`],
      'modal.js': [jsGlobalPath, `${jsRawPath}/modal.js`],
      'radiocheck.js': [jsGlobalPath, `${jsRawPath}/radiocheck.js`],
      'select.js': [jsGlobalPath, `${jsRawPath}/select.js`],
      'tooltip.js': [jsGlobalPath, `${jsRawPath}/tooltip.js`],
      'animate.js': [jsGlobalPath, `${jsRawPath}/animate.js`],
      'ajax.js': [jsGlobalPath, `${jsRawPath}/ajax.js`]
    },

    this.dist.css = `${this.dist.root}/css`;
    this.dist.javascript = `${this.dist.root}/js`;

    return this;
  },
}.init();

gulp.task('styles', () => {
  return gulp.src([paths.src.sass])
    .pipe(sassGlob())
    .on('error', util.log)
    .pipe(sass({
      includePaths: ['_source/scss'],
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    .on('error', util.log)
    .pipe(prefixer('last 2 versions'))
    .on('error', util.log)
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('build-scripts', () => {
  var arg = process.argv.slice(3)[1];
  var scripts = [];
  var buildScripts = [`${paths.src.root}/js/globals.js`];

  if (arg !== undefined) {
    scripts = arg.split(',');
  }

  if (scripts.length === 0) {
    buildScripts.push('_source/js/raw/*.js');
  } else {
    for (var i = 0, len = scripts.length; i < len; i++) {
      buildScripts.push(`_source/js/raw/${scripts[i]}.js`);
    }
  }

  concat({'scripts.js': buildScripts})
  .pipe(gulp.dest(paths.dist.javascript))
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest(paths.dist.javascript))
  .pipe(browserSync.reload({stream: true}));
})

gulp.task('scripts', () => {
  concat(paths.src.components)
  .on('error', util.log)
  .pipe(gulp.dest(paths.dist.javascript))
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .on('error', util.log)
  .pipe(gulp.dest(paths.dist.javascript))
  .on('error', util.log);
});

gulp.task('document', function() {
  return gulp.src('assets/js/scripts.js')
    .pipe(jsdoc(jsdocConfig));
});

gulp.task('serve', () => {
  browserSync.init({
    server: '_site',
    open: false,
    notify: false,

    // Whether to listen on external
    online: false,
  });
});

gulp.task('watch', () => {
  gulp.watch(paths.src.sass, ['styles']);
  gulp.watch(paths.src.javascript, ['scripts', 'build-scripts']);
});

function buildFn(cb) {
  runSequence(
    [
      'styles', 
      'scripts', 
      'build-scripts', 
    ],
    'document',
    cb
  );
}

function watchFn(cb) {
  runSequence(
    'serve',
    'watch',
    [
      'styles', 
      'scripts', 
      'build-scripts', 
    ]
  );
}

gulp.task('build', buildFn);

gulp.task('default', watchFn);

gulp.on('stop', () => {
  setTimeout(function() {
    process.exit(0);
  }, 1000);
});