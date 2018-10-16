const gulp = require("gulp");
const clean = require('gulp-clean');
const babel = require("gulp-babel");
const htmlmin = require('gulp-htmlmin');
const html2txt = require('gulp-html2txt');
const modifyFile = require('gulp-modify-file');
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const cleanCss = require("gulp-clean-css");
const path = require("path");
const through2 = require("through2");
const fs = require("fs");
const data = require("gulp-data");
const template = require("gulp-template");
var groupAggregate = require('gulp-group-aggregate');
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

function cleanBuild() {
    return gulp.src(
        [
            buildFolder
        ], {
            read: false,
            allowEmpty: true
        })
        .pipe(clean());
}

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

function email2txt() {
    return gulp.src([
        buildEmailFolder + "/**/*.html"
    ])
        .pipe(html2txt({
            wordwrap: false,
            ignoreImage: true
        }))
        .pipe(gulp.dest(buildEmailFolder));
}

function emailTemplates() {
    return gulp.src([
        buildEmailFolder + "/**/*.*"
    ])
        .pipe(groupAggregate({
            group: function(file) {
                let filePath = path.parse(file.path);
                return filePath.name + "-" + path.parse(filePath.dir).name;
            },
            aggregate: function(group, files) {
                let htmlContents = null, textContents = null;
                let i = 0, len = files.length;
                for (; i < len; i++) {
                    let file = files[i];
                    switch (path.parse(file.path).ext) {
                        case ".html": htmlContents = String(fs.readFileSync(file.path)); break;
                        case ".txt": textContents = String(fs.readFileSync(file.path)); break;
                    }
                }
                let template = {
                    "Template": {
                        "TemplateName": group,
                        "SubjectPart": htmlContents.match(/<title>([^<]*)<\/title>/)[1],
                        "HtmlPart": htmlContents.replace("{{tracking}}", "https://www.google-analytics.com/collect?v=1&tid=UA-42628014-3&cid={{cid}}&uid={{usertag}}&t=event&ec=email&ea=open&dp=/email/{{templatename}}&dt={{subject}}&cn={{subject}}&cm=email"),
                        "TextPart": textContents
                    }
                };
                return {
                    path: group + "-template.json",
                    contents: new Buffer(JSON.stringify(template, null, 4))
                };
            }
        }))
        .pipe(gulp.dest(buildEmailFolder));
}

function emailTokens() {
    return gulp.src([
        buildEmailFolder + "/**/*.html"
    ])
        .pipe(modifyFile(function(content, path, file) {
            // Process tokens
            let tokens = {};
            let matches = content.match(/{{\w+}}/g);
            if (matches) {
                let i = 0, len = matches.length;
                for (; i < len; i++) {
                    let match = matches[i]
                        .replace("{{", "")
                        .replace("}}", "");
                    tokens[match] = "{{" + match + "}}";
                }
            }

            return JSON.stringify(tokens, null, 4);
        }))
        .pipe(rename(function (path) {
            path.extname = ".json";
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

gulp.task("clean", cleanBuild);
gulp.task("pages", pages);
gulp.task("emailTemplates", emailTemplates);
gulp.task("email2txt", email2txt);
gulp.task("emailTokens", emailTokens);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("favicons", favicons);
gulp.task("images", images);

gulp.task("build", gulp.series("clean", gulp.parallel(gulp.series("pages", "email2txt", "emailTokens", "emailTemplates"), "styles", "scripts", "favicons", "images")));
gulp.task("watch", watch);
gulp.task("serve", gulp.parallel("watch", serve));