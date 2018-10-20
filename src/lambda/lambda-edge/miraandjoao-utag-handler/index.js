'use strict';

const querystring = require("querystring");

function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getCookieExpiration() {
    const date = new Date();
    date.setFullYear(date.getFullYear()+1);
    return `${days[date.getDay()]}, ${pad("00", date.getDate(), true)}-${months[date.getMonth()]}-${date.getFullYear()} ${pad("00", date.getHours(), true)}:${pad("00", date.getMinutes(), true)}:${pad("00", date.getSeconds(), true)} GMT`;
}

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const params = querystring.parse(request.querystring);
    const cookieSettings = "Domain=miraandjoao.com; Path=/; secure; Same-Site=Strict";
    const cookies = [];
    const cookieKeys = ["set-cookie", "set-cookiE", "set-cookIe", "set-cookIE", "set-cooKie"];

    // Parse the user tag
    if (params.ut) {
        const usertag = params.ut;
        delete params.ut;
        cookies.push(`usertag=${usertag}; Expires=${getCookieExpiration()}; Max-Age=${365*24*60*60}`);
    }

    // Parse the utm parameters
    for (const [key, value] of Object.entries(params)) {
        if (key.startsWith("utm_")) {
            cookies.push(`${key}=${value}`);
            delete params[key];
        }
    }

    // If there are any cookies, redirect
    if (cookies.length > 0) {
        let redirect = request.uri;
        let qs = querystring.stringify(params);
        if (qs) {
            redirect += `?${qs}`;
        }
        const response = {
            status: "302",
            statusDescription: "Found",
            headers: {
                location: [{
                    key: "Location",
                    value: redirect,
                }],
                "set-cookie": []
            },
        };
        for (let i=0; i<cookies.length; i++) {
            response.headers["set-cookie"].push({
                key: cookieKeys[i],
                value: `${cookies[i]}; ${cookieSettings}`
            })
        }
        callback(null, response);
    }

    callback(null, request);
};