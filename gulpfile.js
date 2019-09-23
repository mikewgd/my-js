'use strict';

const gulp = require('gulp');
const del = require('del');
const util = require('gulp-util');
const sass = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat-multi');
const rename = require('gulp-rename');
const handlebars = require('gulp-compile-handlebars');
const browserSync = require('browser-sync');
const sassGlob = require('gulp-sass-bulk-import');
const watch = require('gulp-watch');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const jpegtran = require('imagemin-jpegtran');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');
const data = require('gulp-data');
const jshint = require('gulp-jshint');
const jsdoc = require('gulp-jsdoc3');
const handlebarsJS = require('handlebars');
const jsdocConfig = require('./jsdoc/config.json');

handlebarsJS.registerHelper('upper', function(str){
  return str.toUpperCase();
});

const paths = {
  src: { root: 'source' },
  dist: { root: 'dist' },
  init: function() {
    let jsRawPath = `${this.src.root}/js/raw`;
    let jsGlobalPath = `${this.src.root}/js/globals.js`;

    this.src.data = `${this.src.root}/data/*.json`;
    this.src.sass = `${this.src.root}/scss/**/*.scss`;
    this.src.templates = `${this.src.root}/**/*.hbs`;
    this.src.javascript = `${this.src.root}/js/**/*.js`,
    this.src.images = `${this.src.root}/images/**/*.{jpg,jpeg,svg,png,gif}`;
    this.src.files = `${this.src.root}/files/*`;
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
    this.dist.images = `${this.dist.root}/images`;
    this.dist.javascript = `${this.dist.root}/js`;
    this.dist.files = `${this.dist.root}/files`;

    return this;
  },
}.init();

gulp.task('templates', () => {
  var opts = {
    ignorePartials: true,
    batch: [`${paths.src.root}/templates/partials`],
    helpers: {
      capitals: function(str){
				return str.toUpperCase();
      },
      emptyArr: function(total, options) {
        var ret = "";

        for(var i=0, j=total.length; i<j; i++) {
          ret = ret + options.fn(total[i]);
        }

        return ret;
      }
    }
  };

  return gulp.src([`${paths.src.root}/templates/*.hbs`])
    .pipe(data(function(file) {
      if (!/partials/.test(file.path)) {
        return require(file.path.replace('templates', 'data').replace('.hbs', '.json'));
      }
    }))
    .pipe(handlebars(null, opts))
    .on('error', util.log)
    .pipe(rename({
      extname: '.html',
    }))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.root))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('images', () => {
  return gulp.src([paths.src.images])
    .pipe(imagemin({
      use: [jpegtran()],
      progressive: true
    }))
    .pipe(gulp.dest(paths.dist.images));
});

gulp.task('files', function() {
  return gulp.src([paths.src.files])
    .pipe(gulp.dest(paths.dist.files));
});

gulp.task('styles', () => {
  return gulp.src([paths.src.sass])
    .pipe(sassGlob())
    .on('error', util.log)
    .pipe(sass({
      includePaths: ['source/scss'],
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
    buildScripts.push('source/js/raw/*.js');
  } else {
    for (var i = 0, len = scripts.length; i < len; i++) {
      buildScripts.push(`source/js/raw/${scripts[i]}.js`);
    }
  }

  /*.pipe(babel({
    presets: ['es2015'],
    plugins: ['inline-json-import']
  }))*/

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
  return gulp.src('dist/js/scripts.js')
    .pipe(jsdoc(jsdocConfig));
});

gulp.task('serve', () => {
  browserSync.init({
    server: paths.dist.root,
    open: true,
    notify: false,

    // Whether to listen on external
    online: true,
  });
});

gulp.task('clean', () => {
  return del.sync(paths.dist.root)
});

gulp.task('watch', () => {
  gulp.watch(paths.src.sass, ['styles']);
  gulp.watch(paths.src.javascript, ['scripts', 'build-scripts']);
  gulp.watch(paths.src.templates, ['templates']);
  gulp.watch(paths.src.data, ['templates']);
});

watch(paths.src.files, () => {
  gulp.start('files');
});

function buildFn(cb) {
  runSequence(
    'clean',
    [
      'images', 
      'files', 
      'styles', 
      'scripts', 
      'build-scripts', 
      'templates'
    ],
    'document',
    cb
  );
}

function watchFn(cb) {
  runSequence(
    'serve',
    'watch',
    ['images', 'files', 'styles', 'scripts', 'build-scripts', 'templates']
  );
}

gulp.task('build', buildFn);

gulp.task('default', watchFn);


gulp.on('stop', () => {
  setTimeout(function() {
    process.exit(0);
  }, 1000);
});