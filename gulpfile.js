var gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanhtml = require('gulp-cleanhtml'),
    jshint = require('gulp-jshint'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip');

/**
 * Created by Prayansh on 2017-11-04.
 */
'use strict';

var packageJSON = require('./package.json');

//clean build directory
gulp.task('clean', function () {
    return gulp.src('build/*', {read: false})
        .pipe(clean());
});

//generate manifest.json
gulp.task('gen', function () {
    return gulp.src(['app/manifest.json'])
        .pipe(replace('<NAME>', packageJSON.name))
        .pipe(replace('<VERSION>', packageJSON.version))
        .pipe(replace('<DESCRIPTION>', packageJSON.description))
        .pipe(gulp.dest('build'));
});

//copy static folders to build directory
gulp.task('copy', function () {
    gulp.src('app/fonts/**')
        .pipe(gulp.dest('build/fonts'));
    gulp.src('app/img/**')
        .pipe(gulp.dest('build/img'));
    gulp.src('app/css/**')
        .pipe(gulp.dest('build/css'));
    return gulp.src('app/img/**')
        .pipe(gulp.dest('build/img'));
});

//copy and compress HTML files
gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

//run scripts through JSHint
gulp.task('jshint', function () {
    return gulp.src(['app/js/**/*.js', '!app/js/external/**/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts
gulp.task('scripts', ['jshint'], function () {
    gulp.src('app/js/external/**/*.min.js')
        .pipe(gulp.dest('build/js/'));
    return gulp.src(['app/js/**/*.js', '!app/js/external/**/*.js'])
        // .pipe(stripdebug())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

gulp.task('build', ['copy', 'html', 'scripts', 'gen']);

//build ditributable
gulp.task('zip', ['build'], function () {
    var zipName = packageJSON.appName + "_" + packageJSON.version + ".zip";

    //collect all source maps
    return gulp.src('build/**')
        .pipe(zip(zipName))
        .pipe(gulp.dest('dist'));
});

//run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});