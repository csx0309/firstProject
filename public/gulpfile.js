// 引入依赖的gulp
var gulp = require('gulp');
// 引入压缩js的插件
var uglify = require('gulp-uglify');
// 引入压缩css的插件
var cleanCss = require('gulp-clean-css');
// 引入编译less的插件
var less = require('gulp-less');
// 重命名插件
var rename = require('gulp-rename');
// 引入压缩图片的插件
var imagemin = require('gulp-imagemin');
// 引入热更新插件
var livereload = require('gulp-livereload');

// 编译less
gulp.task('less', function () {
    gulp
        .src('styles/less/core.less')
        .pipe(less())
        .pipe(gulp.dest('styles/css/'))
        .pipe(livereload())
}) 

// 压缩css 并且重命名
gulp.task('cleanCss', function () {
    gulp
        .src('styles/css/core.css')
        .pipe(cleanCss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/css/'))
        .pipe(livereload())
}) 

// 压缩js 并且重命名
gulp.task('uglify', function () {
    gulp
        .src('js/*')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/js/'))
        .pipe(livereload())
}) 

// 压缩图片
gulp.task('imagemin', function () {
    gulp
        .src('images/**')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images/'))
}) 
// 观察者
gulp.task('default', function () {
    // 监听热更新
    livereload.listen();
    // 观察源文件 如果有变动 执行对应的任务
    gulp.watch('styles/less/*.less', ['less']);
    gulp.watch('styles/css/core.css', ['cleanCss']);
    gulp.watch('js/*.js', ['uglify']);
})