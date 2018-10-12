const gulp = require("gulp");
const browserSync = require('browser-sync');

const buildFolder = "build";
const buildImgFolder = buildFolder + "/img";

function copy() {
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
        .pipe(gulp.dest(buildFolder));
}

function scripts() {
    return gulp.src([
        "src/*.js"
    ])
        .pipe(gulp.dest(buildFolder));
}

function images() {
    return gulp.src([
        "src/img/*.jpg",
        "src/img/*.png"
    ])
        .pipe(gulp.dest(buildImgFolder));
}

function serve() {
    return browserSync.init({
        server: 'build',
        open: false,
        port: 3000
    });
}

gulp.task("copy", copy);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("images", images);

gulp.task("build", gulp.series("copy", "styles", "scripts", "images"));
gulp.task("serve", gulp.series("build", serve));