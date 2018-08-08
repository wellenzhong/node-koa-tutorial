'use strict';
const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const path = require('path');
const LessAutoprefix = require('less-plugin-autoprefix');
const autoprefix = new LessAutoprefix({
    browsers: ['last 2 versions']
});
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const clean = require('gulp-clean')
const base64 = require('gulp-css-base64')
var runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector');
gulp.task('default', function () {
    // 将你的默认的任务代码放在这
});

gulp.task('clean-scripts', function () {
    return gulp.src('./app/public/javascript/min/*.js', {
        read: false
    })
        .pipe(clean());
});

gulp.task('clean-style', function () {
    return gulp.src('./app/public/stylesheets/min/*.css', {
        read: false
    })
        .pipe(clean());
});

//less预编译样式文件
gulp.task('less', function () {
    return gulp.src('./client/src/less/**/*.less')
        .pipe(less({
            plugins: [autoprefix],
        }))
        .pipe(gulp.dest('./public/src/css'))
        .pipe(gulp.dest('./app/public/stylesheets/src'));
});
//拼接样式文件
gulp.task('concat', ['less', 'clean-style'], function () {
    return gulp.src(['./app/public/common/css/**/*.css', './app/public/stylesheets/src/**/*.css'])
        .pipe(concat('style.min.css'))
        .pipe(base64({
            baseDir: './app/public/assets/images/**/*',
        }))
        .pipe(gulp.dest('./app/public/stylesheets'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./app/public/stylesheets/min'))
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
})
//压缩js文件
gulp.task('js', ['clean-scripts'], function () {
    return gulp.src('./client/src/scripts/*.js')
        .pipe(babel({
            presets: ['env'],
        }))
        .pipe(gulp.dest('./app/public/javascript/src'))
        .pipe(gulp.dest('./public/src/js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/public/javascript/min'))
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});
//自动执行,暂时被刷新浏览器的任务替代,这个没执行
gulp.task('watch', function () {
    gulp.watch('./client/src/less/**/*.less', ['less', 'concat']).on('change', function () {
        browserSync.reload
    });
    gulp.watch('./client/src/scripts/*.js', ['js']);
})


//把添加了版本号的文件加载到页面上
gulp.task('revHtml', function () {
    return gulp.src(['rev/**/*.json', './app/view/**/*.ejs']) /*view可自行配置*/
        .pipe(revCollector())
        .pipe(gulp.dest('./app/view')); /*Html更换css、js文件版本,WEB-INF/views也是和本地html文件的路径一致*/
});

//浏览器自动刷新
gulp.task('browser-sync', function () {
    browserSync.init({
        proxy: "http://172.19.60.53:8888"
    });
    gulp.watch('./client/src/less/**/*.less', ['concat']);
    gulp.watch('./app/public/stylesheets/*.*').on('change', function () {
        browserSync.reload()
    })
    gulp.watch('./client/src/scripts/*.js', ['js']).on('change', function () {
        browserSync.reload()
    });
    gulp.watch('./app/view/**/*.*').on('change', function () {
        browserSync.reload()
    })
});

gulp.task('default', ['less', 'concat', 'js']);