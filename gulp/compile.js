'use strict';

var gulp = require('gulp');
var hb = require('gulp-hb');
var rename = require('gulp-rename');
var data = require('gulp-data');

gulp.task('templates', function () {
  var hbStream = hb()
    .partials('source/templates/partials/*.hbs')
    .partials('source/templates/*.hbs')

  return gulp.src('./source/templates/*.hbs')
    .pipe(data(function(file) {
      return require(file.path.replace('templates', 'data').replace('.hbs', '.json'));
    }))
    .pipe(hbStream)
    .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest('dist'));
});
