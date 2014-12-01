
var http = require('http');
var path = require('path');
var gulp = require('gulp');

var gutil = require('gulp-util');
var todo = require('gulp-todo');
var removeLines = require('gulp-remove-lines');
var replace = require('gulp-replace');
var vinylPaths = require('vinyl-paths');
var del = require('del');

var bower = require('gulp-bower');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var flatten = require("gulp-flatten");

var coffeelint = require('gulp-coffeelint');
var coffee = require('gulp-coffee');
var cjsx = require('gulp-cjsx');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var less = require('gulp-less');
var uncss = require('gulp-uncss');
var minifyCSS = require('gulp-minify-css');

var jade = require('gulp-jade');

var watch = require("gulp-watch");
var nodemon = require("gulp-nodemon");
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr')();

var LIVERELOAD_PORT = 35729;
var BASEDIR = path.join(__dirname, 'server/views');

gulp.task('clean-scripts-build', function() {
  return gulp.src('build/scripts/*.*', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-scripts-dist', function() {
  return gulp.src('dist/scripts/*.*', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-styles-build', function() {
  return gulp.src('build/styles/*.*', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-styles-dist', function() {
  return gulp.src('dist/styles/*.*', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-templates-build', function() {
  return gulp.src('build/**/*.html', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-templates-dist', function() {
  return gulp.src('dist/**/*.html', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('clean-server', function() {
  return gulp.src('server/**/*.js', {read: false})
    .pipe(vinylPaths(del));
});

gulp.task('copy-to-build', function() {
  gulp.src(['client/**/*.*', '!client/**/*.{coffee,cjsx,less}'])
    .pipe(gulp.dest('build'));
});

gulp.task('copy-to-dist', function() {
  gulp.src(['client/**/*.*', '!client/**/*.{coffee,cjsx,less}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts-build', ['clean-scripts-build'], function() {
  var thirdParty = gulp.src([
    'third-party/jquery/dist/jquery.js',
    'third-party/lodash/dist/lodash.js',
    'third-party/react/react.js',
    'third-party/bootstrap/dist/js/bootstrap.js'
    ])
    .pipe(flatten())
    .pipe(gulp.dest('build/scripts'));
  var CJSX = gulp.src('client/scripts/components/**/*.cjsx')
    .pipe(cjsx({bare: true}).on('error', gutil.log))
    .on('error', function(err){ console.log(err.message); })
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('react-components.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(livereload(tinylr));
  var scripts = gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .on('error', function(err){ console.log(err.message); })
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(livereload(tinylr));
  return (thirdParty && CJSX && scripts);
});

gulp.task('scripts-dist', ['clean-scripts-dist'], function() {
  var thirdParty = gulp.src([
    'third-party/jquery/dist/jquery.min.js',
    'third-party/lodash/dist/lodash.min.js',
    'third-party/react/react.min.js',
    'third-party/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(flatten())
    .pipe(gulp.dest('dist/scripts'));
  var CJSX = gulp.src('client/scripts/components/**/*.cjsx')
    .pipe(cjsx({bare: true}).on('error', gutil.log))
    // .pipe(replace(/\/images\//g, '/dist/images/'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('react-components.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'));
  var scripts = gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    // .pipe(replace(/\/images\//g, '/dist/images/'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'));
  return (thirdParty && CJSX && scripts);
});

gulp.task('scripts-server', function() {
  return gulp.src(['server/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(gulp.dest('server'));
});

gulp.task('bootstrap-styles', ['templates-build'], function() {
  return gulp.src('third-party/bootstrap/dist/css/bootstrap.css')
    .pipe(uncss({
      html: ['build/index.html'],
      ignore: ['hover', 'focus', 'active']
    }))
    .pipe(removeLines({'filters': [/sourceMappingURL/]}))
    .pipe(gulp.dest('client/css'))
});

gulp.task('styles-build', ['clean-styles-build'], function() {
  return gulp.src(['client/less/*.less'])
    .pipe(less())
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('build/styles'))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(minifyCSS({ removeEmpty: true }))
    .pipe(gulp.dest('build/styles'))
    .pipe(livereload(tinylr));
});

gulp.task('styles-dist', ['clean-styles-dist', 'templates-dist'], function() {
  return gulp.src('client/less/*.less')
    .pipe(less())
    // .pipe(replace(/\/images\//g, '/dist/images/'))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(minifyCSS({ removeEmpty: true }))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('templates-build', function() {
  return gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: { env: 'dev', marker: (new Date()).getTime(), liveReloadPort: LIVERELOAD_PORT }
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('build'))
});

gulp.task('templates-dist', ['clean-templates-dist'], function() {
  gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: { env: 'pro', marker: (new Date()).getTime() }
    }))
    // .pipe(replace(/\/images\//g, '/dist/images/'))
    .pipe(gulp.dest('dist'))
});

gulp.task('serve', function () {
  nodemon({
    watch: ['server/'],
    script: 'server/app.js',
    ext: 'coffee'
    })
    .on('change', ['scripts-server'])
    .on('restart', function () {
      console.log('restarted!')
    })
  tinylr.listen(LIVERELOAD_PORT, function() {
    console.log('TinyLR Listening on %s', LIVERELOAD_PORT);
  });
});

gulp.task('watch', function() {
  gulp.watch(['client/scripts/**/*.coffee', 'client/scripts/components/**/*.cjsx'], ['scripts-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('client/less/**/*.less', ['styles-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('server/views/**/*.jade', ['templates-build']);
  gulp.watch('build/**/*.html').on('change', function(file) {
    if (file.type != 'changed') {
      return null;
    } 
    tinylr.changed({ body: { files: ['index.html'] } });
  });
});

gulp.task('bower', function(){
  return bower();
});

gulp.task('todo', ['scripts-server', 'templates-build', 'scripts-build'], function(){
  return gulp.src([
    'server/**/*.js',
    'server/views/**/*.jade',
    'build/scripts/main.js',
    'build/scripts/react-components.js'
    ])
    .pipe(todo({
      fileName: 'TODO.md'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('server', [
  'bootstrap-styles',
  'scripts-server',
  'scripts-build',
  'styles-build',
  'copy-to-build',
  'clean-templates-build',
  'templates-build',
  'serve',
  'watch'
]);

gulp.task('dist', [
  'bootstrap-styles',
  'scripts-server',
  'scripts-dist',
  'styles-dist',
  'copy-to-dist',
  'templates-dist'
]);
