const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const cleanCss = require("gulp-clean-css");
const path = require("path");
const through2 = require("through2");
const fs = require("fs");
const data = require("gulp-data");
const template = require("gulp-template");
const browserSync = require("browser-sync");

// Configuration
const srcFolder = "src";
const buildFolder = "build";
const languages = ["en", "ru"];

// Web App
const appFolder = srcFolder + "/app";
const buildAppFolder = buildFolder + "/app"
const buildAppImgFolder = buildAppFolder + "/img";

function pages() {
    return gulp.src([
        appFolder + "/*.html"
    ])
        .pipe(through2.obj(function(file, enc, next) {
            let pageContents = file.contents.toString();
            let pagePath = path.parse(file.path);
            let i = 0, len = languages.length;
            for (; i < len; i++) {
                let lang = languages[i];
                let newFile = file.clone();
                newFile.contents = new Buffer(pageContents);
                newFile.path = path.join(pagePath.dir, "i18n", lang, pagePath.name + pagePath.ext);
                this.push(newFile);
            }

            next();
        }))
        .pipe(data(function(file) {
            let lang = path.parse(path.parse(file.path).dir).name;
            return JSON.parse(fs.readFileSync(appFolder + "/i18n/" + lang + ".json"));
        }))
        .pipe(template())
        .pipe(gulp.dest(buildAppFolder));
}

function styles() {
    return gulp.src([
        appFolder + "/*.css"
    ])
        .pipe(cleanCss({
            compatibility: "ie8"
        }))
        .pipe(gulp.dest(buildAppFolder));
}

function scripts() {
    return gulp.src([
        appFolder + "/*.js"
    ])
        .pipe(babel({
            presets: ["@babel/env"]
        }))
        .pipe(uglify({ mangle: { toplevel: true } }))
        .pipe(gulp.dest(buildAppFolder));
}

function favicons() {
    return gulp.src([
        appFolder + "/*.ico",
        appFolder + "/*.png"
    ])
        .pipe(gulp.dest(buildAppFolder));
}

function images() {
    return gulp.src([
        appFolder + "/img/*.jpg",
        appFolder + "/img/*.png"
    ])
        .pipe(gulp.dest(buildAppImgFolder));
}

function watch() {
    return gulp.watch([
        appFolder + "/*.*",
        appFolder + "/**/*.*"
    ] , gulp.series("build"));
}

function serve() {
    return browserSync.init({
        server: 'build/app',
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