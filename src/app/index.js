const apiHost = "https://api.miraandjoao.com";

$(function(){

    // Navigation
    let initNav = function() {
        $("a[href^='#']").click(function () {
            let sectionTo = $(this).attr('href');
            $('.navbar-collapse').collapse('hide');
            $('html, body').animate({
                scrollTop: $(sectionTo).offset().top
            }, 'slow');
        });
    };

    // Animation
    let initAnimation = function() {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out-sine',
        });
    };

    // Countdown
    let initCountdown = function() {
        const secondsInMinute = 60;
        const secondsInHour = secondsInMinute*60;
        const secondsInDay = secondsInHour*24;
        const targetDate = moment.tz("2019-10-11 14:00", "Europe/Lisbon").utc();
        const localTimezone = moment.tz.guess(true);
        var timer = setInterval(function() {
            let now = moment().tz(localTimezone).utc();
            if (now < targetDate) {
                const delta = targetDate.diff(now, 'seconds');
                //console.log(delta);
                const days = Math.floor(delta/secondsInDay);
                const hours = Math.floor((delta - (days*secondsInDay))/secondsInHour);
                const minutes = Math.floor((delta - (days*secondsInDay) - (hours*secondsInHour))/secondsInMinute);
                const seconds = Math.floor(delta - (days*secondsInDay) - (hours*secondsInHour) - (minutes*secondsInMinute));

                $('#countdown-days').html(days);
                $('#countdown-hours').html(hours);
                $('#countdown-minutes').html(minutes);
                $('#countdown-seconds').html(seconds);
            } else {
                clearInterval(timer);

                $('#countdown-days').html('00');
                $('#countdown-hours').html('00');
                $('#countdown-minutes').html('00');
                $('#countdown-seconds').html('00');
            }
        }, 1000);
    };

    initNav();
    initAnimation();
    initCountdown();
    initRsvp();
});

function applyTemplate(content, tokens) {
    for (let prop in tokens) {
        if (tokens.hasOwnProperty(prop)) {
            content = content.replace(new RegExp(`<%= ${prop} %>`, "g"), tokens[prop]);
        }
    }
    return content;
}

const nameId = "txtNameId",
    comingId = "selComingId",
    dietId = "selDietId",
    allergiesId = "txtAllergiesId",
    rsvpNoneSelected = "rsvpNoneSelected",
    rsvpYesSelected = "rsvpYesSelected",
    rsvpNoSelected = "rsvpNoSelected",
    dietNoneSelected = "dietNoneSelected",
    dietStandardSelected = "dietStandardSelected",
    dietVegetarianSelected = "dietVegetarianSelected",
    dataI18nName = "data-i18n-name",
    dataI18nComing = "data-i18n-coming",
    dataI18nComingPlaceholder = "data-i18n-comingplaceholder",
    dataI18nYes = "data-i18n-yes",
    dataI18nNo = "data-i18n-no",
    dataI18nDietaryRequirements = "data-i18n-dietaryrequirements",
    dataI18nDietPlaceholder = "data-i18n-dietplaceholder",
    dataI18nStandard = "data-i18n-standard",
    dataI18nVegetarian = "data-i18n-vegetarian",
    dataI18nAllergies = "data-i18n-allergies",
    dataI18nAllergiesPlaceholder = "data-i18n-allergiesplaceholder";
const personTemplateHtml = `
<div class="form-group col-12 col-md-4">
    <label for="<%= ${nameId} %>"><%= ${dataI18nName} %></label>
    <input id="<%= ${nameId} %>" class="form-control" value="<%= valName %>" readonly required>
</div>
<div class="form-group col-12 col-md-2">
    <label for="<%= ${comingId} %>"><%= ${dataI18nComing} %></label>
    <select id="<%= ${comingId} %>" class="form-control" required>
        <option value="" <%= ${rsvpNoneSelected} %> disabled hidden><%= ${dataI18nComingPlaceholder} %></option>
        <option value="true" <%= ${rsvpYesSelected} %>><%= ${dataI18nYes} %></option>
        <option value="false" <%= ${rsvpNoSelected} %>><%= ${dataI18nNo} %></option>
    </select>
</div>
<div class="form-group col-12 col-md-6">
    <label for="<%= ${dietId} %>"><%= ${dataI18nDietaryRequirements} %></label>
    <select id="<%= ${dietId} %>" class="form-control" required>
        <option value="" <%= ${dietNoneSelected} %> disabled hidden><%= ${dataI18nDietPlaceholder} %></option>
        <option value="Standard" <%= ${dietStandardSelected} %>><%= ${dataI18nStandard} %></option>
        <option value="Vegetarian" <%= ${dietVegetarianSelected} %>><%= ${dataI18nVegetarian} %></option>
    </select>
</div>
<div class="form-group col-12">
    <label for="<%= ${allergiesId} %>"><%= ${dataI18nAllergies} %></label>
    <textarea id="<%= ${allergiesId} %>" class="form-control" rows="3" placeholder="<%= ${dataI18nAllergiesPlaceholder} %>"><%= valAllergies %></textarea>
</div>`;

function initRsvp() {
    let userTag = getCookie("usertag");
    if (userTag) {
        fetch(`${apiHost}/rsvp/${userTag}`, {
            method: "GET"
        })
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`${response.status}`);
                }
            })
            .then(function (rsvp) {
                let grpPeople = $("#grpPeople");
                grpPeople.attr("data-people-count", rsvp.people.length);
                for (let i=0; i<rsvp.people.length; i++) {
                    const person = rsvp.people[i];

                    // Build tokens
                    let tokens = {};
                    tokens[nameId] = `${nameId}${i}`;
                    tokens[comingId] = `${comingId}${i}`;
                    tokens[dietId] = `${dietId}${i}`;
                    tokens[allergiesId] = `${allergiesId}${i}`;
                    tokens[rsvpNoneSelected] = person.rsvpResponse == undefined || person.rsvpResponse == null ? "selected" : "";
                    tokens[rsvpYesSelected] = person.rsvpResponse ? "selected" : "";
                    tokens[rsvpNoSelected] = person.rsvpResponse == undefined || person.rsvpResponse == null || !person.rsvpResponse ? "" : "selected";
                    tokens[dietNoneSelected] = person.diet == undefined || person.diet == null ? "selected" : "";
                    tokens[dietStandardSelected] = person.diet == "Standard" ? "selected" : "";
                    tokens[dietVegetarianSelected] = person.diet == "Vegetarian" ? "selected" : "";
                    tokens[dataI18nName] = grpPeople.attr(dataI18nName);
                    tokens[dataI18nComing] = grpPeople.attr(dataI18nComing);
                    tokens[dataI18nComingPlaceholder] = grpPeople.attr(dataI18nComingPlaceholder);
                    tokens[dataI18nYes] = grpPeople.attr(dataI18nYes);
                    tokens[dataI18nNo] = grpPeople.attr(dataI18nNo);
                    tokens[dataI18nDietaryRequirements] = grpPeople.attr(dataI18nDietaryRequirements);
                    tokens[dataI18nDietPlaceholder] = grpPeople.attr(dataI18nDietPlaceholder);
                    tokens[dataI18nStandard] = grpPeople.attr(dataI18nStandard);
                    tokens[dataI18nVegetarian] = grpPeople.attr(dataI18nVegetarian);
                    tokens[dataI18nAllergies] = grpPeople.attr(dataI18nAllergies);
                    tokens[dataI18nAllergiesPlaceholder] = grpPeople.attr(dataI18nAllergiesPlaceholder);
                    tokens.valName = person.name;
                    tokens.valAllergies = person.allergies ? person.allergies : "";

                    // Apply template
                    const html = applyTemplate(personTemplateHtml, tokens).replace("/\s\s+/g", " ");
                    grpPeople.append(html);
                }
                if (rsvp.bacheloretteparty) {
                    $("#chkBacheloretteParty").prop("checked", true);
                }
                if (rsvp.bachelorparty) {
                    $("#chkBachelorParty").prop("checked", true);
                }
                $("#rsvp-available").removeClass("rsvp-hidden");
            })
            .catch(function (err) {
                switch (err.message) {
                    case "403":
                        $("#rsvp-forbidden").removeClass("rsvp-hidden");
                        break;
                    case "404":
                        $("#rsvp-notfound").removeClass("rsvp-hidden");
                        break;
                    default:
                        $("#rsvp-error").removeClass("rsvp-hidden");
                        break;
                }

            })
            .finally(function () {
                $("#rsvp-loading").addClass("rsvp-hidden");
            });
    } else {
        $("#rsvp-loading").addClass("rsvp-hidden");
        $("#rsvp-forbidden").removeClass("rsvp-hidden");
    }
}

/*
// Maps
function initMaps() {
    let vilaVita = {lat: 37.101457, lng: -8.3824047, placeId: 'ChIJX4iNCUTRGg0RSrvhjFgQ3VE'};
    let ourLady = {lat: 37.1254143, lng: -8.4011588, placeId: 'ChIJ0UW4BtXWGg0R2XoubH9KSsk'};
    let places = [
        vilaVita,
        ourLady
    ]
    let map = new google.maps.Map($('#googleMap')[0], {
        center: {
            lat: places.reduce(function(a, b) { return a.lat + b.lat; })/places.length,
            lng: places.reduce(function(a, b) { return a.lng + b.lng; })/places.length,
        },
        zoom: 13
    });

    let vilaVitaMarker = new google.maps.Marker({position: vilaVita, map: map});
    let ourLadyMarker = new google.maps.Marker({position: ourLady, map: map});
}*/
