
var gulp = require('gulp');

var bower = require('gulp-bower');
var clean = require('gulp-clean');

var coffeelint = require('gulp-coffeelint');
var coffee = require('gulp-coffee');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var less = require('gulp-less');

var paths = {
  scripts: ['server/**/*.coffee', 'client/**/*.coffee'],
  styles: []
};

gulp.task('bower', function(){
  return bower();
});

gulp.task('clean-build', function() {
  gulp.src('build', {read: false})
    .pipe(clean());
});

gulp.task('lint', function () {
  return gulp.src(['./server/**/*.coffee', './client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});

gulp.task('scripts', function() {
  return gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('default', ['clean-build', 'scripts']);
