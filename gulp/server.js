'use strict';

var gulp = require('gulp');
var path = require('path');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var runSequence = require('run-sequence');

function isOnlyChange(event) {
  return event.type === 'changed';
}

// Static Server + watching scss/html files
gulp.task('serve', function() {
  browserSync.init({
    serveStatic: ['dist']
  });

  gulp.watch([
    'source/css/*'
    ], function(event) {
      if (isOnlyChange(event)) {
        runSequence('clean-css', 'css', 'reloader');
      }
    });

  gulp.watch([
    'source/templates/*.hbs',
    'source/data/*.json'
    ], function(event) {
      if (isOnlyChange(event)) {
        runSequence('clean', 'templates', 'css', 'scripts', 'reloader');
      }
    });

  gulp.watch([
    'source/js/**/*.js'
    ], function(event) {
      if (isOnlyChange(event)) {
        runSequence('clean-js', 'scripts', 'reloader');
      }
    });
});

// reloading browsers
gulp.task('reloader', function (done) {
  browserSync.reload();
  done();
});