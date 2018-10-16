const gulp = require("gulp");
const babel = require("gulp-babel");
const htmlmin = require('gulp-htmlmin');
const html2txt = require('gulp-html2txt');
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
const appLayoutFolder = appFolder + "/_layout";
const buildAppFolder = buildFolder + "/app";
const buildAppImgFolder = buildAppFolder + "/img";
const buildEmailFolder = buildFolder + "/email";

function applyLayout(pageContents) {
    let layoutString = pageContents.substring(0, pageContents.indexOf("\n"));
    let match = layoutString.match(/<!--layout="([^"]+)" title="([^"]+)"-->/);
    if (match) {
        let layout = fs.readFileSync(appLayoutFolder + "/" + match[1]).toString();
        layout = layout
            .replace("<!--title-->", match[2])
            .replace("<!--content-->", pageContents.substring(pageContents.indexOf("\n")+1));
        return layout;
    }
    return pageContents;
}

function pages() {
    return gulp.src([
        appFolder + "/*.html",
        appFolder + "/**/*.html"
    ])
        .pipe(through2.obj(function(file, enc, next) {
            let pageContents = file.contents.toString();
            let pagePath = path.parse(file.path);

            // Ignore layout folder
            if (pagePath.dir.endsWith(appLayoutFolder)) {
                next();
                return;
            }

            // Apply layout
            pageContents = applyLayout(pageContents);

            // Emit file per language
            let i = 0, len = languages.length;
            for (; i < len; i++) {
                let lang = languages[i];
                let newFile = file.clone();
                newFile.contents = new Buffer(pageContents);
                let dir = path.relative(appFolder, pagePath.dir) === "email"
                    ? path.join(buildEmailFolder, lang)
                    : path.join(appFolder, "i18n", lang, path.relative(appFolder, pagePath.dir));
                newFile.path = path.join(dir, pagePath.name + pagePath.ext);
                newFile.lang = lang;
                this.push(newFile);
            }

            next();
        }))
        .pipe(data(function(file) {
            let lang = file.lang;
            return JSON.parse(fs.readFileSync(appFolder + "/i18n/" + lang + ".json"));
        }))
        .pipe(template())
        .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true }))
        .pipe(gulp.dest(buildAppFolder));
}

function email2text() {
    return gulp.src([
        buildEmailFolder + "/**/*.html"
    ])
        .pipe(html2txt({
            wordwrap: false,
            ignoreImage: true
        }))
        .pipe(gulp.dest(buildEmailFolder));
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
        server: "build/app",
        open: false,
        port: 3000,
        files: ["build/app/*.*", "build/app/**/*.*"]
    });
}

gulp.task("pages", pages);
gulp.task("email2text", email2text);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("favicons", favicons);
gulp.task("images", images);

gulp.task("build", gulp.parallel(gulp.series("pages", "email2text"), "styles", "scripts", "favicons", "images"));
gulp.task("watch", watch);
gulp.task("serve", gulp.parallel("watch", serve));