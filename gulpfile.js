
var path            = require('path');
var gulp            = require('gulp');

var gutil           = require('gulp-util');
var replace         = require('gulp-replace');
var vinylPaths      = require('vinyl-paths');
var del             = require('del');

var concat          = require('gulp-concat');
var rename          = require("gulp-rename");
var flatten         = require("gulp-flatten");

var coffeelint      = require('gulp-coffeelint');
var coffee          = require('gulp-coffee');
var jshint          = require('gulp-jshint');
var uglify          = require('gulp-uglify');

var sass            = require('gulp-sass');
var minifyCSS       = require('gulp-clean-css');

var imagemin        = require('gulp-imagemin');

var pug             = require('gulp-pug');

var watch           = require("gulp-watch");
var nodemon         = require("gulp-nodemon");
var browserSync     = require('browser-sync').create();
var packageJSON     = require('./package.json')


var BASEDIR = path.join(__dirname, packageJSON.templatePath);

var defaultOptions = function(options) {
  if (typeof options === 'undefined') { options = {}; }
  if (typeof options.copyPaths === 'undefined') { options.copyPaths = ['client/!(sass|coffee|images)/**/*.*', 'client/*.!(html)']; }
  if (typeof options.prefix != 'string') { options.prefix = ''; }
  if (typeof options.minified != 'boolean') { options.minified = false; }
  if (typeof options.watch != 'boolean') { options.watch = false; }
  return options;
}

var clean = function(paths){
  return gulp.src(paths, {read: false})
    .pipe(vinylPaths(del));
};

var copy = function(destinationPath, options){
  options = defaultOptions(options);
  return gulp.src(options.copyPaths)
    .pipe(gulp.dest(destinationPath))
};

var thirdPartyScripts = function(destinationPath, options) {
  options = defaultOptions(options);
  if (options.minified === true) {
    return gulp.src(packageJSON.production.scripts)
      .pipe(flatten())
      .pipe(gulp.dest(destinationPath));
  } else {
    return gulp.src(packageJSON.development.scripts)
      .pipe(flatten())
      .pipe(gulp.dest(destinationPath));
  }
};

var scripts = function(destinationPath, options) {
  options = defaultOptions(options);
  return gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee()).on('error', function(err){ console.log(err.message); })
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + (new Date()).getTime()))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat(options.watch === true ? 'main.js' : 'main.min.js'))
    .pipe(options.watch === false ? uglify() : gutil.noop())
    .pipe(gulp.dest(destinationPath))
    .pipe(options.watch === true ? browserSync.stream() : gutil.noop());
};

var styles = function(destinationPath, options) {
  options = defaultOptions(options);
  return gulp.src(['client/sass/*.scss'])
    .pipe(sass()).on('error', sass.logError)
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + (new Date()).getTime()))
    .pipe(options.watch === false ? rename({ extname: '.min.css' }) : gutil.noop())
    .pipe(options.watch === false ? minifyCSS({ removeEmpty: true }) : gutil.noop())
    .pipe(gulp.dest(destinationPath))
    .pipe(options.watch === true ? browserSync.stream() : gutil.noop());
};

var images = function(destinationPath, options) {
  options = defaultOptions(options);
  return gulp.src('client/images/**')
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(destinationPath));
};

var templates = function(destinationPath, options) {
  options = defaultOptions(options);
  var marker = (new Date()).getTime(),
      locals = {
        env: options.watch === true ? 'dev' : 'pro',
        marker: marker,
        prefixPath: options.prefix
      };
  return gulp.src('server/views/pages/**/*.jade')
    .pipe(pug({
      basedir: BASEDIR,
      locals: locals
    })).on('error', function(err){ console.log(err.message); })
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + marker))
    .pipe(gulp.dest(destinationPath));
};

gulp.task('clean-build', function() {
  return clean('build**');
});

gulp.task('clean-copy-build', function() {
  return clean(['build/!(scripts|styles|images)/**/*.!(html)']);
});

gulp.task('clean-scripts-build', function() {
  return clean('build/scripts/*.*');
});

gulp.task('clean-styles-build', function() {
  return clean('build/styles/*.*');
});

gulp.task('clean-images-build', function() {
  return clean('build/images/*.*');
});

gulp.task('clean-templates-build', function() {
  return clean('build/**/*.html');
});

gulp.task('clean-dist', function() {
  return clean('dist/*.*');
});

gulp.task('clean-live', function() {
  return clean('live/*.*');
});

gulp.task('clean-server', function() {
  return clean('server/**/*.js');
});

gulp.task('copy-to-build', ['clean-copy-build'], function() {
  return copy('build', { watch: true });
});

gulp.task('copy-to-dist', function() {
  return copy('dist');
});

gulp.task('copy-to-live', function() {
  return copy('live');
});

gulp.task('scripts-build', ['clean-scripts-build'], function() {
  return thirdPartyScripts('build/scripts') &&
    scripts('build/scripts', { watch: true });
});

gulp.task('scripts-dist', function() {
  return thirdPartyScripts('dist/scripts', { minified: true }) &&
    scripts('dist/scripts', { prefix: packageJSON.production.distPrefix });
});

gulp.task('scripts-live', function() {
  return thirdPartyScripts('live/scripts', { minified: true }) &&
    scripts('live/scripts');
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

gulp.task('styles-build', ['clean-styles-build'], function() {
  return styles('build/styles', { watch: true });
});

gulp.task('styles-dist', ['templates-dist'], function() {
  return styles('dist/styles', { prefix: packageJSON.production.distPrefix });
});

gulp.task('styles-live', ['templates-live'], function() {
  return styles('live/styles');
});

gulp.task('templates-build', ['clean-templates-build'], function() {
  return templates('build', { watch: true });
});

gulp.task('images-build', ['clean-images-build'], function() {
  return images('build/images');
});

gulp.task('images-dist', function() {
  return images('dist/images');
});

gulp.task('images-live', function() {
  return images('live/images');
});

gulp.task('templates-dist', function() {
  return templates('dist', { prefix: packageJSON.production.distPrefix });
});

gulp.task('templates-live', function() {
  return templates('live');
});

gulp.task('server', ['scripts-server'], function (callback) {
  //var started = false;
  return nodemon({
    watch: ['server/'],
    script: 'server/app.js',
    ext: 'coffee'
    })
    .on('start', function(){
      //if ( started ) { return; }
      //started = true;
      callback();
    })
    .on('change', ['scripts-server'])
    .on('restart', function () {
      console.log('restarted!')
    })
});

gulp.task('watch', [
  'styles-build',
  'scripts-build',
  'images-build',
  'templates-build',
  'copy-to-build',
  'server'
], function() {

  browserSync.init({
    proxy: "http://localhost:" + packageJSON.development.port,
    port: packageJSON.development.proxyPort
  });

  gulp.watch('client/sass/**/*.scss', ['styles-build']);
  gulp.watch('client/coffee/**/*.coffee', ['scripts-build']);
  gulp.watch('client/images/**', ['images-build']);
  gulp.watch('server/views/**/*.jade', ['templates-build']);
  gulp.watch('client/!(sass|coffee|images)/**/*.*', ['copy-to-build']);
  gulp.watch(['build/images/**', 'build/fonts/**', 'build/**/*.html']).on('change', browserSync.reload);
});

gulp.task('dist', [
  'clean-dist',
  'images-dist',
  'templates-dist',
  'scripts-server',
  'scripts-dist',
  'styles-dist',
  'copy-to-dist'
]);

gulp.task('live', [
  'clean-live',
  'images-live',
  'templates-live',
  'scripts-server',
  'scripts-live',
  'styles-live',
  'copy-to-live'
]);
