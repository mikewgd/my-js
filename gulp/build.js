'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');

gulp.task('clean', function() {
  return del.sync(['dist'], {force:true})
});

gulp.task('clean-js', function() {
  return del.sync(['dist/js'],{force:true});
});

gulp.task('clean-css', function() {
  return del.sync(['dist/css'],{force:true});
});

gulp.task('build', function() {
  runSequence('clean', 'templates', 'scripts', 'css');
});