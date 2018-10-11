// Constants
const langConst = "lang";
const i18nKeyConst = "data-i18n-key";

function processQueryString() {
    let queryStringParams = {};
    let urlPairs = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
    for (let i = 0; i < urlPairs.length; i++) {
        let urlParam = urlPairs[i].split("=");
        queryStringParams[urlParam[0]] = urlParam[1];
    }

    // Set the language cookie if it exists
    let lang = queryStringParams[langConst];
    if (lang) {
        // Write the cookie
        Cookies.set(langConst, lang, { expires: 365 });
    }
}

function applyLanguage() {
    let lang = Cookies.get(langConst);
    if (lang) {
        console.log("Setting language to " + lang);

        // Download the language file
        $.ajax({
            url: "i18n/" + lang + ".json",
            method: "GET"
        })
            .done(function(langData) {
                console.log("Found language " + lang);

                $("[" + i18nKeyConst + "]").each(function() {
                    let translation = langData[$(this).attr(i18nKeyConst)];
                    $(this).text(translation);
                })
            })
            .fail(function(xhr) {
                console.warn("Did not find language " + lang);
            });
    }
}

$.when($.ready).then(function(){
    processQueryString();
    applyLanguage();
});