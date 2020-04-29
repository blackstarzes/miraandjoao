const gulp = require("gulp");
const babel = require("gulp-babel");
const browserSync = require("browser-sync");
const clean = require('gulp-clean');
const cleanCss = require("gulp-clean-css");
const concat = require("gulp-concat");
const data = require("gulp-data");
const filelist = require('gulp-filelist');
const filter = require('gulp-filter');
const fs = require("fs");
const groupAggregate = require('gulp-group-aggregate');
const html2txt = require('gulp-html2txt');
const htmlmin = require('gulp-htmlmin');
const imageResize = require('gulp-image-resize');
const modifyFile = require('gulp-modify-file');
const nunjucksRender = require('gulp-nunjucks-render');
const os = require("os");
const parallel = require('concurrent-transform');
const path = require("path");
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const template = require("gulp-template");
const through2 = require("through2");
const uglify = require("gulp-uglify");

// Configuration
const srcFolder = "src";
const buildFolder = "build";
const languages = ["en", "ru"];

// Third party
const thirdPartyFolder = "node_modules";
const thirdPartyScripts = [
    "aos/dist/aos.js",
    "moment/min/moment.min.js",
    "moment-timezone/builds/moment-timezone-with-data.min.js"
    ];
const thirdPartyStyles = [
    "aos/dist/aos.css"
];

// Web App
const appFolder = srcFolder + "/app";
const appGalleryFolder = appFolder + "/gallery";
const appLayoutFolder = appFolder + "/_layout";
const buildAppFolder = buildFolder + "/app";
const buildAppImgFolder = buildAppFolder + "/img";
const buildAppGalleryFolder = buildAppFolder + "/gallery";
const buildDataFolder = buildFolder + "/data";
const buildEmailFolder = buildFolder + "/email";

function cleanAll() {
    return gulp.src([
        buildFolder + "/*/"
    ], {
        read: false,
        allowEmpty: true
    })
        .pipe(clean());
}

function cleanBuild() {
    return gulp.src([
        buildFolder + "/**/*"
    ], {
        read: false,
        allowEmpty: true,
        nodir: true
    })
        .pipe(filter([
            "**",
            "!" + buildAppGalleryFolder + "/**/*-loader.jpg",
            "!" + buildAppGalleryFolder + "/**/*-thumbnail*.jpg",
            "!" + buildAppGalleryFolder + "/**/*-view*.jpg",
        ]))
        .pipe(clean());
}

function cleanGalleryOptimisation() {
    return gulp.src([
        buildAppGalleryFolder + "/**/*-loader.jpg",
        buildAppGalleryFolder + "/**/*-thumbnail*.jpg",
        buildAppGalleryFolder + "/**/*-view*.jpg",
    ], {
        read: false,
        allowEmpty: true
    })
        .pipe(clean());
}

function optimiseImages(maxWidthHeight, suffix) {
    return gulp.src([
        appGalleryFolder + "/**/*.jpg"
        // appGalleryFolder + "/**/*.jpg"
    ])
        .pipe(parallel(
            imageResize({
                width: maxWidthHeight,
                height: maxWidthHeight,
                imageMagick: true,
                noProfile: true
            }),
            os.cpus().length
        ))
        .pipe(rename(function(path) {
            path.basename += suffix;
        }))
        .pipe(gulp.dest(buildAppGalleryFolder));
}

function galleryLoaders() {
    return optimiseImages(16, "-loader");
}

function galleryThumbnails() {
    return optimiseImages(100, "-thumbnail");
}

function galleryThumbnails2x() {
    return optimiseImages(200, "-thumbnail-2x");
}

function galleryThumbnails3x() {
    return optimiseImages(300, "-thumbnail-3x");
}

function galleryViews() {
    return optimiseImages(800, "-view");
}

function galleryViews2x() {
    return optimiseImages(1600, "-view-2x");
}

function galleryViews3x() {
    return optimiseImages(2400, "-view-3x");
}

function galleryOriginals() {
    return gulp.src([
        appGalleryFolder + "/**/*.jpg"
    ])
        .pipe(gulp.dest(buildAppGalleryFolder));
}

function staticData() {
    return gulp.src([
        appFolder + "/*.njk.data.json",
        appFolder + "/**/*.njk.data.json"
    ])
        .pipe(gulp.dest(buildDataFolder));
}

function galleryData() {
    return gulp.src(JSON.parse(fs.readFileSync(appFolder + "/gallery/gallery.json")), {
        root: appFolder + "/gallery",
        base: appFolder
    })
        .pipe(filelist("gallery.json", { relative: true }))
        .pipe(modifyFile(function(content, path, file) {
            // Prepare transformed object
            let data = {
                galleryIndex: [],
                galleryData: []
            };

            // Process files
            let currentNameI18nKey = "";
            let currentIndex = {};
            let currentGroup = {};
            let galleryFiles = JSON.parse(content);
            for (let i=0; i<galleryFiles.length; i++) {
                let galleryFile = galleryFiles[i];
                let nameI18nKey = galleryFile
                    .split("/")[1];

                // Check if we have moved on to a new group
                if (nameI18nKey !== currentNameI18nKey) {
                    currentNameI18nKey = nameI18nKey;
                    currentGroup = {
                        nameI18nKey: currentNameI18nKey,
                        images: []
                    }
                    currentIndex = {
                        nameI18nKey: currentNameI18nKey,
                        index: i
                    };
                    data.galleryIndex.push(currentIndex);
                    data.galleryData.push(currentGroup);
                }

                //Add the current file to the group
                currentGroup.images.push({
                    loader: "/" + galleryFile.replace(".jpg", "") + "-loader.jpg",
                    thumbnail: "/" + galleryFile.replace(".jpg", "") + "-thumbnail.jpg",
                    thumbnail2x: "/" + galleryFile.replace(".jpg", "") + "-thumbnail-2x.jpg",
                    thumbnail3x: "/" + galleryFile.replace(".jpg", "") + "-thumbnail-3x.jpg",
                    view: "/" + galleryFile.replace(".jpg", "") + "-view.jpg",
                    view2x: "/" + galleryFile.replace(".jpg", "") + "-view-2x.jpg",
                    view3x: "/" + galleryFile.replace(".jpg", "") + "-view-3x.jpg",
                    original: "/" + galleryFile,
                    alt: "description"
                });
            }

            return JSON.stringify(data, null, 4);
        }))
        .pipe(rename("index.njk.data.json"))
        .pipe(gulp.dest(buildDataFolder));
}

function pages() {
    return gulp.src([
        appFolder + "/*.njk",
        appFolder + "/**/*.njk",
        "!" + appFolder + "/_layout/*.njk",
        "!" + appFolder + "/_layout/**/*.njk"
    ])
        .pipe(data(function(file) {
            const dataPath = file.path.replace("/src/app/", "/build/data/") + ".data.json";
            if (fs.existsSync(dataPath)) {
                return JSON.parse(fs.readFileSync(dataPath));
            }
            return {};
        }))
        .pipe(nunjucksRender({
            path: [appLayoutFolder]
        }))
        .pipe(through2.obj(function(file, enc, next) {
            let pageContents = file.contents.toString();
            let pagePath = path.parse(file.path);

            // Ignore layout folder
            if (pagePath.dir.endsWith(appLayoutFolder)) {
                next();
                return;
            }

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
        .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true, removeComments: true }))
        .pipe(gulp.dest(buildAppFolder));
}

function email2txt() {
    return gulp.src([
        buildEmailFolder + "/**/*.html"
    ])
        .pipe(html2txt({
            wordwrap: false,
            ignoreImage: true,
            baseElement: ["div.email-container"],
            format: {
                heading: function(elem, fn, options) {
                    var h = fn(elem.children, options);
                    return h + "\n\n";
                }
            }
        }))
        .pipe(gulp.dest(buildEmailFolder));
}

function emailTemplates() {
    return gulp.src([
        buildEmailFolder + "/**/*.(html|txt)"
    ])
        .pipe(groupAggregate({
            group: function(file) {
                let filePath = path.parse(file.path);
                return filePath.name + "-" + path.parse(filePath.dir).name;
            },
            aggregate: function(group, files) {
                let htmlContents = null, textContents = null, campaign = null, lang = null;
                let i = 0, len = files.length;
                for (; i < len; i++) {
                    let file = files[i];
                    let filePath = path.parse(file.path);
                    switch (filePath.ext) {
                        case ".html":
                            htmlContents = String(fs.readFileSync(file.path));
                            campaign = filePath.name;
                            lang = path.parse(filePath.dir).name;
                            break;
                        case ".txt":
                            textContents = String(fs.readFileSync(file.path));
                            break;
                    }
                }
                let subject = htmlContents.match(/<title>([^<]*)<\/title>/)[1];
                let tracking = `https://www.google-analytics.com/collect?v=1&tid=UA-42628014-3&cid={{cid}}&uid={{usertag}}&t=event&ec=email&ea=open&dp=/email/${group}&dt=${subject}&cn=${campaign}&cm=email&ul=${lang}`;
                let template = {
                    "Template": {
                        "TemplateName": group,
                        "SubjectPart": subject,
                        "HtmlPart": htmlContents
                            .replace("{{tracking}}", tracking)
                            .replace(/{{campaign}}/g, campaign)
                            .replace(/{{source}}/g, group),
                        "TextPart": textContents
                            .replace(/{{campaign}}/g, campaign)
                            .replace(/{{source}}/g, group)
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
        buildEmailFolder + "/*-template.json"
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
            path.basename += "-tokens";
        }))
        .pipe(gulp.dest(buildEmailFolder));
}

function styles() {
    return gulp.src([
        appFolder + "/*.scss"
    ])
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCss({
            compatibility: "ie8"
        }))
        .pipe(gulp.dest(buildAppFolder));
}

function stylesThirdParty() {
    return gulp.src(thirdPartyStyles.map(function(item){
        return `${thirdPartyFolder}/${item}`
    }))
        .pipe(concat("thirdParty.css"))
        .pipe(gulp.dest(buildAppFolder));
}

function scripts() {
    return gulp.src([
        appFolder + "/*.js"
    ])
        .pipe(babel({
            presets: ["@babel/env"]
        }))
        .pipe(uglify({ mangle: { toplevel: true, reserved: ['initMaps'] } }))
        .pipe(gulp.dest(buildAppFolder));
}

function scriptsThirdParty() {
    return gulp.src(thirdPartyScripts.map(function(item){
        return `${thirdPartyFolder}/${item}`
    }))
        .pipe(concat("thirdParty.js"))
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

function watchEmails() {
    return gulp.watch([
        appFolder + "/_layout/*.*",
        appFolder + "/_layout/**/*.*",
        appFolder + "/email/*.*",
        appFolder + "/email/**/*.*",
        appFolder + "/i18n/*.*",
        appFolder + "/i18n/**/*.*"
    ], gulp.series("buildEmails"));
}

function watch() {
    return gulp.watch([
        appFolder + "/*.*",
        appFolder + "/**/*.*"
    ] , {
        debounceDelay: 2000
    }, gulp.series("build"));
}

function serveEmails() {
    return browserSync.init({
        server: "build/email",
        open: false,
        port: 3010,
        files: ["build/email/*.*", "build/email/**/*.*"]
    })
}

function serve() {
    return browserSync.init({
        server: "build/app",
        open: false,
        port: 3000,
        files: ["build/app/*.*", "build/app/**/*.*"]
    });
}

gulp.task("cleanAll", cleanAll)
gulp.task("cleanBuild", cleanBuild);
gulp.task("galleryLoaders", galleryLoaders);
gulp.task("galleryThumbnails", gulp.series(
    galleryThumbnails,
    galleryThumbnails2x,
    galleryThumbnails3x
));
gulp.task("galleryViews", gulp.series(
    galleryViews,
    galleryViews2x,
    galleryViews3x
));
gulp.task("galleryOriginals", galleryOriginals);
gulp.task("staticData", staticData);
gulp.task("galleryData", galleryData);
gulp.task("pages", pages);
gulp.task("email2txt", email2txt);
gulp.task("emailTemplates", emailTemplates);
gulp.task("emailTokens", emailTokens);
gulp.task("styles", styles);
gulp.task("stylesThirdParty", stylesThirdParty);
gulp.task("scripts", scripts);
gulp.task("scriptsThirdParty", scriptsThirdParty);
gulp.task("favicons", favicons);
gulp.task("images", images);

gulp.task("cleanGalleryOptimisation", cleanGalleryOptimisation);
gulp.task("galleryOptimisation", gulp.series(
    "galleryLoaders",
    "galleryThumbnails",
    "galleryViews"
));

gulp.task("buildEmails", gulp.series(
    "pages",
    "email2txt",
    "emailTemplates",
    "emailTokens"
));
gulp.task("watchEmails", watchEmails);
gulp.task("serveEmails", gulp.series(
   "buildEmails",
   gulp.parallel(
       "watchEmails",
       serveEmails
   )
));

gulp.task("build", gulp.series(
    "cleanBuild",
    gulp.parallel(
        gulp.series(
            "staticData",
            "galleryData",
            "pages",
            "email2txt",
            "emailTemplates",
            "emailTokens"
        ),
        "styles",
        "stylesThirdParty",
        "scripts",
        "scriptsThirdParty",
        "favicons",
        "images",
        "galleryOriginals"
    )
));
gulp.task("watch", watch);
gulp.task("serve", gulp.series(
    "build",
    gulp.parallel(
        "watch",
        serve
    )
));