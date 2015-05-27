
var http = require('http');
var path = require('path');
var gulp = require('gulp');

var gutil = require('gulp-util');
var todo = require('gulp-todo');
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
var minifyCSS = require('gulp-minify-css');

var jade = require('gulp-jade');

var watch = require("gulp-watch");
var nodemon = require("gulp-nodemon");
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr')();

var LIVERELOAD_PORT = 35729;
var BASEDIR = path.join(__dirname, 'server/views');
var UNCSS_REFERENCE_HTML = [
  'build/index.html'
];
var DIST_PREFIX_PATH = '';
var THIRD_PARTY_SCRIPTS = [
  'third-party/jquery/dist/jquery.js',
  'third-party/lodash/dist/lodash.js',
  'third-party/react/react.js',
  'third-party/bootstrap/dist/js/bootstrap.js'
];
var THIRD_PARTY_SCRIPTS_MINIFIED = [
  'third-party/jquery/dist/jquery.min.js',
  'third-party/lodash/dist/lodash.min.js',
  'third-party/react/react.min.js',
  'third-party/bootstrap/dist/js/bootstrap.min.js'
];

var defaultOptions = function(options) {
  if (typeof options === 'undefined') { options = {}; }
  if (typeof options.copyPaths === 'undefined') { options.copyPaths = ['client/**/*.*', '!client/**/*.{coffee,cjsx,less,css,map,html}']; }
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
    .pipe(options.watch === true ? livereload(tinylr) : gutil.noop());
};

var thirdPartyScripts = function(destinationPath, options) {
  options = defaultOptions(options);
  if (options.minified === true) {
    return gulp.src(THIRD_PARTY_SCRIPTS_MINIFIED)
      .pipe(flatten())
      .pipe(gulp.dest(destinationPath));
  } else {
    return gulp.src(THIRD_PARTY_SCRIPTS)
      .pipe(flatten())
      .pipe(gulp.dest(destinationPath));
  }
};

var cjsxScripts = function(destinationPath, options) {
  options = defaultOptions(options);
  return gulp.src('client/coffee/**/*.cjsx')
    .pipe(cjsx({bare: true}).on('error', gutil.log))
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + (new Date()).getTime()))
    .pipe(concat(options.watch === true ? 'react-components.js' : 'react-components.min.js'))
    .pipe(options.watch === false ? uglify() : gutil.noop())
    .pipe(gulp.dest(destinationPath))
    .pipe(options.watch === true ? livereload(tinylr) : gutil.noop());
};

var coffeeScripts = function(destinationPath, options) {
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
    .pipe(options.watch === true ? livereload(tinylr) : gutil.noop());
};

var lessStyles = function(destinationPath, options) {
  options = defaultOptions(options);
  return gulp.src(['client/less/*.less'])
    .pipe(less()).on('error', function(err){ console.log(err.message); })
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + (new Date()).getTime()))
    .pipe(options.watch === false ? rename({ extname: '.min.css' }) : gutil.noop())
    .pipe(options.watch === false ? minifyCSS({ removeEmpty: true }) : gutil.noop())
    .pipe(gulp.dest(destinationPath))
    .pipe(options.watch === true ? livereload(tinylr) : gutil.noop());
};

var jadeTemplates = function(destinationPath, options) {
  options = defaultOptions(options);
  var marker = (new Date()).getTime(),
      locals = {
        env: options.watch === true ? 'dev' : 'pro',
        marker: marker,
        prefixPath: options.prefix
      };
  if (options.watch === true) { locals.liveReloadPort = LIVERELOAD_PORT; }
  return gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: locals
    })).on('error', function(err){ console.log(err.message); })
    .pipe(options.prefix.length > 0 ? replace(/\/images\//g, options.prefix + '/images/') : gutil.noop())
    .pipe(replace(/\.(jpg|jpeg|gif|png|svg)$/g, '.$1?' + marker))
    .pipe(gulp.dest(destinationPath))
    .pipe(options.watch === true ? livereload(tinylr) : gutil.noop());
};

gulp.task('clean-build', function() {
  return clean(['build/**/*.*', '!build/**/*.{js,css,html,map}']);
});

gulp.task('clean-scripts-build', function() {
  return clean('build/scripts/*.*');
});

gulp.task('clean-styles-build', function() {
  return clean('build/styles/*.*');
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

gulp.task('copy-to-build', ['clean-build'], function() {
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
    cjsxScripts('build/scripts', { watch: true }) &&
    coffeeScripts('build/scripts', { watch: true });
});

gulp.task('scripts-dist', function() {
  return thirdPartyScripts('dist/scripts', { minified: true }) &&
    cjsxScripts('dist/scripts', { prefix: DIST_PREFIX_PATH }) &&
    coffeeScripts('dist/scripts', { prefix: DIST_PREFIX_PATH });
});

gulp.task('scripts-live', function() {
  return thirdPartyScripts('live/scripts', { minified: true }) &&
    cjsxScripts('live/scripts') && 
    coffeeScripts('live/scripts');
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
    .pipe(gulp.dest('client/css'))
});

gulp.task('styles-build', ['clean-styles-build'], function() {
  return lessStyles('build/styles', { watch: true });
});

gulp.task('styles-dist', ['templates-dist'], function() {
  return lessStyles('dist/styles', { prefix: DIST_PREFIX_PATH });
});

gulp.task('styles-live', ['templates-live'], function() {
  return lessStyles('live/styles');
});

gulp.task('templates-build', ['clean-templates-build'], function() {
  return jadeTemplates('build', { watch: true });
});

gulp.task('templates-dist', function() {
  return jadeTemplates('dist', { prefix: DIST_PREFIX_PATH });
});

gulp.task('templates-live', function() {
  return jadeTemplates('live');
});

gulp.task('serve', ['scripts-server'], function () {
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
  gulp.watch(['client/**/*.*', '!client/**/*.{coffee,cjsx,less,html,map}'], ['copy-to-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch(['client/coffee/**/*.coffee', 'client/coffee/**/*.cjsx'], ['scripts-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('client/less/**/*.less', ['styles-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('server/views/**/*.jade', ['bootstrap-styles']).on('change', function(file) {
    tinylr.changed(file.path);
  });
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
  'scripts-server',
  'bootstrap-styles',
  'templates-build',
  'scripts-build',
  'styles-build',
  'copy-to-build',
  'serve',
  'watch'
]);

gulp.task('dist', [
  'clean-dist',
  'bootstrap-styles',
  'templates-dist',
  'scripts-server',
  'scripts-dist',
  'styles-dist',
  'copy-to-dist'
]);

gulp.task('live', [
  'clean-live',
  'bootstrap-styles',
  'templates-live',
  'scripts-server',
  'scripts-live',
  'styles-live',
  'copy-to-live'
]);
