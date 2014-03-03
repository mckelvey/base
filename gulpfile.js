
var http = require('http');
var path = require('path');
var gulp = require('gulp');

var bower = require('gulp-bower');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var flatten = require("gulp-flatten");

var coffeelint = require('gulp-coffeelint');
var coffee = require('gulp-coffee');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var jade = require('gulp-jade');

var watch = require("gulp-watch");
var nodemon = require("gulp-nodemon");
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr')();

var LIVERELOAD_PORT = 35729;
var BASEDIR = path.join(__dirname, 'server/views');
var STATIC_PAGES_ROOT = __dirname + '/server/views/pages';
var PAGE_WAIT = 2000;

gulp.task('bower', function(){
  return bower();
});

gulp.task('clean-build', function() {
  gulp.src('build/*.*', {read: false})
    .pipe(clean());
});

gulp.task('clean-dist', function() {
  gulp.src('dist/*.*', {read: false})
    .pipe(clean());
});

gulp.task('third-party-build', function() {
  gulp.src(['third-party/*/dist/*.js'])
    .pipe(flatten())
    .pipe(gulp.dest('build/scripts/third-party'));
});

gulp.task('third-party-dist', function() {
  gulp.src(['third-party/*/dist/*.js'])
    .pipe(flatten())
    .pipe(gulp.dest('dist/scripts/third-party'));
});

gulp.task('scripts-build', function() {
  gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(rename('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/scripts'))
    .pipe(livereload(tinylr));
});

gulp.task('scripts-dist', function() {
  gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('scripts-server', function() {
  gulp.src(['server/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(gulp.dest('server'));
});

gulp.task('less-build', function() {
  gulp.src('client/less/*.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('build/styles'))
    .pipe(rename('main.min.css'))
    .pipe(minifyCSS({ removeEmpty: true }))
    .pipe(gulp.dest('build/styles'))
    .pipe(livereload(tinylr));
});

gulp.task('less-dist', function() {
  gulp.src('client/less/*.less')
    .pipe(less())
    .pipe(concat('main.min.css'))
    .pipe(minifyCSS({ removeEmpty: true }))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('templates-build', function() {
  gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: { env: 'dev', liveReloadPort: LIVERELOAD_PORT }
    }))
    .pipe(gulp.dest('build'))
});

gulp.task('serve', function () {
  nodemon({ script: 'server/app.js', ext: 'coffee' })
    .on('restart', ['scripts-server'])
  tinylr.listen(LIVERELOAD_PORT, function() {
    console.log('TinyLR Listening on %s', LIVERELOAD_PORT);
  });
});

gulp.task('watch', function() {
  gulp.watch('client/scripts/*.coffee', ['scripts-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('client/less/*.less', ['less-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('server/views/**/*.jade', ['templates-build']).on('change', function(file) {
    var filename = '/' + path.relative(STATIC_PAGES_ROOT, file.path).replace(/\.jade$/, '.html');
    setTimeout(function(){tinylr.changed({ body: { files: [filename] } });}, PAGE_WAIT);
  });
});

gulp.task('server', [
  'scripts-server',
  'clean-build',
  'third-party-build',
  'scripts-build',
  'templates-build',
  'less-build',
  'serve',
  'watch'
]);

gulp.task('dist', [
  'scripts-server',
  'clean-dist',
  'third-party-dist',
  'scripts-dist',
  'templates-dist',
  'less-dist'
]);
