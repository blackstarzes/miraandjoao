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

    if (params.ut) {
        const usertag = params.ut;
        delete params.ut;
        const response = {
            status: "302",
            statusDescription: "Found",
            headers: {
                location: [{
                    key: "Location",
                    value: `${request.uri}?${querystring.stringify(params)}`,
                }],
                "set-cookie": [{
                    key: "Set-Cookie",
                    value: `usertag=${usertag}; Expires=${getCookieExpiration()}; Max-Age=${365*24*60*60}; Domain=miraandjoao.com; Path=/; secure; Same-Site=Strict`
                }]
            },
        };
        callback(null, response);
    }

    callback(null, request);
};