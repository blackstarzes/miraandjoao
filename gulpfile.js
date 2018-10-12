const gulp = require("gulp");
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync');

const buildFolder = "build";
const buildImgFolder = buildFolder + "/img";

function pages() {
    return gulp.src([
        "src/*.html",
        "src/*.ico",
        "src/*.png"
    ])
        .pipe(gulp.dest(buildFolder));
}

function styles() {
    return gulp.src([
        "src/*.css"
    ])
        .pipe(cleanCss({
            compatibility: "ie8"
        }))
        .pipe(gulp.dest(buildFolder));
}

function scripts() {
    return gulp.src([
        "src/*.js"
    ])
        .pipe(babel({
            presets: ["@babel/env"]
        }))
        .pipe(uglify({ mangle: { toplevel: true } }))
        .pipe(gulp.dest(buildFolder));
}

function images() {
    return gulp.src([
        "src/img/*.jpg",
        "src/img/*.png"
    ])
        .pipe(gulp.dest(buildImgFolder));
}

function watch() {
    return gulp.watch([
        "src/*.*",
        "src/**/*.*"
        ]
        , gulp.series("build"));
}

function serve() {
    return browserSync.init({
        server: 'build',
        open: false,
        port: 3000
    });
}

gulp.task("pages", pages);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("images", images);

gulp.task("build", gulp.parallel("pages", "styles", "scripts", "images"));
gulp.task("watch", watch);
gulp.task("serve", gulp.series("watch", serve));