'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var concat = require('gulp-concat-multi');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var source = [
  'source/js/**/*.js'
];
var globalJs = 'source/js/globals.js';
var rename = require('gulp-rename');
var concatSrc = {
  'accordion.js': [globalJs, 'source/js/raw/accordion.js'],
  'carousel.js': [globalJs, 'source/js/raw/carousel.js'],
  'input.js': [globalJs, 'source/js/raw/input.js'],
  'modal.js': [globalJs, 'source/js/raw/modal.js'],
  'radiocheck.js': [globalJs, 'source/js/raw/radiocheck.js'],
  'select.js': [globalJs, 'source/js/raw/select.js'],
  'tooltip.js': [globalJs, 'source/js/raw/tooltip.js']
};

// JS Linting
gulp.task('lint', function() {
  return gulp.src(source)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('sass', function () {
  return gulp.src('source/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    // .pipe(autoprefixer(['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('images', function() {
  return gulp.src('source/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('files', function() {
  return gulp.src('source/files/*')
    .pipe(gulp.dest('dist/files'));
});

gulp.task('uglify', function () {
  concat(concatSrc)
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist/js'));
})

gulp.task('scripts', ['lint', 'uglify'], function() {
  concat(concatSrc)
  .pipe(gulp.dest('dist/js'));
});

gulp.task('custom-build', ['clean-js'], function() {
  var arg = process.argv.slice(3)[1];
  var scripts = arg.split(',');
  var buildScripts = [globalJs];

  if (scripts[0] === 'all') {
    buildScripts.push('source/js/raw/*.js');
  } else {
    for (var i = 0, len = scripts.length; i < len; i++) {
      buildScripts.push('source/js/raw/'+scripts[i]+'.js');
    }
  }

  concat({'scripts.js': buildScripts})
  .pipe(gulp.dest('dist/js'))
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist/js'));
});


