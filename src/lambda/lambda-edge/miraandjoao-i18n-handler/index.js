"use strict";

/* This is an origin request function */
exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;

    const languages = ["en", "ru"];

    let selectLanguage = function (supportedLanguages, acceptLanguage, options) {
        options = options || {};

        if (!supportedLanguages || !supportedLanguages.length || !acceptLanguage) {
            return null;
        }

        if (typeof(acceptLanguage) === "string") {
            acceptLanguage = (acceptLanguage || "")
                .match(/((([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)(;q=[0-1](\.[0-9]+)?)?)*/g)
                .map(function (m) {
                    if (!m) {
                        return;
                    }

                    let bits = m.split(';');
                    let ietf = bits[0].split('-');
                    let hasScript = ietf.length === 3;

                    return {
                        code: ietf[0],
                        script: hasScript ? ietf[1] : null,
                        region: hasScript ? ietf[2] : ietf[1],
                        quality: bits[1] ? parseFloat(bits[1].split('=')[1]) : 1.0
                    };
                }).filter(function (r) {
                    return r;
                }).sort(function (a, b) {
                    return b.quality - a.quality;
                });
        }

        let supported = supportedLanguages.map(function (support) {
            let bits = support.split('-');
            let hasScript = bits.length === 3;

            return {
                code: bits[0],
                script: hasScript ? bits[1] : null,
                region: hasScript ? bits[2] : bits[1]
            };
        });

        for (let i = 0; i < acceptLanguage.length; i++) {
            let lang = acceptLanguage[i];
            let langCode = lang.code.toLowerCase();
            let langRegion = lang.region ? lang.region.toLowerCase() : lang.region;
            let langScript = lang.script ? lang.script.toLowerCase() : lang.script;
            for (let j = 0; j < supported.length; j++) {
                let supportedCode = supported[j].code.toLowerCase();
                let supportedScript = supported[j].script ? supported[j].script.toLowerCase() : supported[j].script;
                let supportedRegion = supported[j].region ? supported[j].region.toLowerCase() : supported[j].region;
                if (langCode === supportedCode &&
                    (options.loose || !langScript || langScript === supportedScript) &&
                    (options.loose || !langRegion || langRegion === supportedRegion)) {
                    return supportedLanguages[j];
                }
            }
        }

        return null;
    };

    // Original request
    let acceptLanguage = request.headers["accept-language"][0].value;
    let uri = request.uri;
    console.log(`Request uri="${uri}" accept-language="${acceptLanguage}"`);

    // Language
    let language = selectLanguage(languages, acceptLanguage, { loose: true });
    if (!language) {
        language = "en";
    }

    // URL rewrite
    if (!request.uri || request.uri === "") {
        request.uri = "/";
    }
    if (request.uri.endsWith("/")) {
        request.uri += "index.html";
    }

    // Final resource
    request.uri = "/i18n/" + language + request.uri;
    console.log(`Selected language "${language}" when accept-language="${acceptLanguage}" - request uri changed from "${uri}" to "${request.uri}"`);

    callback(null, request);
};