const gulp = require("gulp");
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const path = require("path");
const through2 = require("through2");
const fs = require("fs");
const data = require("gulp-data");
const template = require("gulp-template");
const browserSync = require('browser-sync');

const buildFolder = "build";
const buildImgFolder = buildFolder + "/img";
const languages = ["en", "ru"];

function pages() {
    return gulp.src([
        "src/*.html"
    ])
        .pipe(through2.obj(function(file, enc, next) {
            let pageContents = file.contents.toString();
            let pagePath = path.parse(file.path);
            let i = 0, len = languages.length;
            for (; i < len; i++) {
                let lang = languages[i];
                let newFile = file.clone();
                newFile.contents = new Buffer(pageContents);
                newFile.path = path.join(pagePath.dir, pagePath.name + "_" + lang + pagePath.ext);
                this.push(newFile);
            }

            next();
        }))
        .pipe(data(function(file) {
            let filename = path.parse(file.path).name;
            let lang = filename.substring(filename.indexOf("_") + 1);
            return JSON.parse(fs.readFileSync("src/i18n/" + lang + ".json"));
        }))
        .pipe(template())
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

function favicons() {
    return gulp.src([
        "src/*.ico",
        "src/*.png"
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
gulp.task("favicons", favicons);
gulp.task("images", images);

gulp.task("build", gulp.parallel("pages", "styles", "scripts", "favicons", "images"));
gulp.task("watch", watch);
gulp.task("serve", gulp.parallel("watch", serve));