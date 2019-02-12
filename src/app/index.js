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
        let timer = setInterval(function() {
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

const selected = "selected",
    indexAttr = "data-index",
    rsvpPersonClass = "rsvp-person",
    rsvpYes = "rsvpYes",
    rsvpYesClass = "rsvp-yes",
    nameId = "txtNameId",
    comingId = "selComingId",
    dietFormGroupId = "grpDietId",
    dietId = "selDietId",
    allergiesFormGroupId = "grpAllergiesId",
    allergiesId = "txtAllergiesId",
    rsvpNoneSelected = "rsvpNoneSelected",
    rsvpYesSelected = "rsvpYesSelected",
    rsvpNoSelected = "rsvpNoSelected",
    dietStandard = "Standard",
    dietVegetarian = "Vegetarian",
    dietNotApplicable = "NotApplicable",
    dietNoneSelected = "dietNoneSelected",
    dietStandardSelected = "dietStandardSelected",
    dietVegetarianSelected = "dietVegetarianSelected",
    dietNotApplicableSelected = "dietNotApplicableSelected",
    dataI18nName = "data-i18n-name",
    dataI18nNameValidation = "data-i18n-namevalidation",
    dataI18nComing = "data-i18n-coming",
    dataI18nComingPlaceholder = "data-i18n-comingplaceholder",
    dataI18nComingValidation = "data-i18n-comingvalidation",
    dataI18nYes = "data-i18n-yes",
    dataI18nNo = "data-i18n-no",
    dataI18nDietaryRequirements = "data-i18n-dietaryrequirements",
    dataI18nDietaryRequirementsPlaceholder = "data-i18n-dietaryrequirementsplaceholder",
    dataI18nDietaryRequirementsValidation = "data-i18n-dietaryrequirementsvalidation",
    dataI18nStandard = "data-i18n-standard",
    dataI18nVegetarian = "data-i18n-vegetarian",
    dataI18nAllergies = "data-i18n-allergies",
    dataI18nAllergiesPlaceholder = "data-i18n-allergiesplaceholder";
const personTemplateHtml = `
<div class="form-row ${rsvpPersonClass} <%= ${rsvpYes} %>" ${indexAttr}="<%= ${indexAttr} %>">
    <div class="form-group col-12 col-md-6">
        <label for="<%= ${nameId} %>"><%= ${dataI18nName} %></label>
        <input id="<%= ${nameId} %>" class="form-control" value="<%= valName %>" readonly required>
        <div class="invalid-feedback"><%= ${dataI18nNameValidation} %></div>
    </div>
    <div class="form-group col-12 col-md-6">
        <label for="<%= ${comingId} %>"><%= ${dataI18nComing} %></label>
        <select id="<%= ${comingId} %>" class="form-control coming-select" required>
            <option value="" <%= ${rsvpNoneSelected} %> disabled hidden><%= ${dataI18nComingPlaceholder} %></option>
            <option value="true" <%= ${rsvpYesSelected} %>><%= ${dataI18nYes} %></option>
            <option value="false" <%= ${rsvpNoSelected} %>><%= ${dataI18nNo} %></option>
        </select>
        <div class="invalid-feedback"><%= ${dataI18nComingValidation} %></div>
    </div>
    <div id="<%= ${dietFormGroupId} %>" class="form-group col-12 rsvp-yes">
        <label for="<%= ${dietId} %>"><%= ${dataI18nDietaryRequirements} %></label>
        <select id="<%= ${dietId} %>" class="form-control" required>
            <option value="" <%= ${dietNoneSelected} %> disabled hidden><%= ${dataI18nDietaryRequirementsPlaceholder} %></option>
            <option value="${dietNotApplicable}" <%= ${dietNotApplicableSelected} %> hidden><%= ${dataI18nDietaryRequirementsPlaceholder} %></option>
            <option value="${dietStandard}" <%= ${dietStandardSelected} %>><%= ${dataI18nStandard} %></option>
            <option value="${dietVegetarian}" <%= ${dietVegetarianSelected} %>><%= ${dataI18nVegetarian} %></option>
        </select>
        <div class="invalid-feedback"><%= ${dataI18nDietaryRequirementsValidation} %></div>
    </div>
    <div id="<%= ${allergiesFormGroupId} %>" class="form-group col-12 rsvp-yes">
        <label for="<%= ${allergiesId} %>"><%= ${dataI18nAllergies} %></label>
        <textarea id="<%= ${allergiesId} %>" class="form-control" rows="3" placeholder="<%= ${dataI18nAllergiesPlaceholder} %>"><%= valAllergies %></textarea>
    </div>
</div>`;

function loadRsvp(rsvp) {
    let rsvpForm = $("#rsvpForm");
    $(".coming-select").unbind("change");
    $(`.${rsvpPersonClass}`).remove();
    rsvpForm.attr("data-people-count", rsvp.people.length);
    for (let i=0; i<rsvp.people.length; i++) {
        const person = rsvp.people[i];

        // Build tokens
        let tokens = {};
        tokens[indexAttr] = `${i}`;
        tokens[rsvpYes] = person.rsvpResponse ? rsvpYesClass : "";
        tokens[nameId] = `${nameId}${i}`;
        tokens[comingId] = `${comingId}${i}`;
        tokens[dietFormGroupId] = `${dietFormGroupId}${i}`;
        tokens[dietId] = `${dietId}${i}`;
        tokens[allergiesFormGroupId] = `${allergiesFormGroupId}${i}`;
        tokens[allergiesId] = `${allergiesId}${i}`;
        tokens[rsvpYesSelected] = person.rsvpResponse ? selected : "";
        tokens[rsvpNoSelected] = person.rsvpResponse != undefined && person.rsvpResponse != null && !person.rsvpResponse ? selected : "";
        tokens[rsvpNoneSelected] = tokens[rsvpYesSelected] != selected && tokens[rsvpNoSelected] != selected ? selected : "";
        tokens[dietStandardSelected] = person.diet == dietStandard ? selected : "";
        tokens[dietVegetarianSelected] = person.diet == dietVegetarian ? selected : "";
        tokens[dietNotApplicableSelected] = person.diet == dietNotApplicable ? selected : "";
        tokens[dietNoneSelected] = person.diet != dietStandard || person.diet != dietVegetarian || person.diet != dietNotApplicable ? selected : "";
        tokens[dataI18nName] = rsvpForm.attr(dataI18nName);
        tokens[dataI18nNameValidation] = rsvpForm.attr(dataI18nNameValidation);
        tokens[dataI18nComing] = rsvpForm.attr(dataI18nComing);
        tokens[dataI18nComingValidation] = rsvpForm.attr(dataI18nComingValidation);
        tokens[dataI18nComingPlaceholder] = rsvpForm.attr(dataI18nComingPlaceholder);
        tokens[dataI18nYes] = rsvpForm.attr(dataI18nYes);
        tokens[dataI18nNo] = rsvpForm.attr(dataI18nNo);
        tokens[dataI18nDietaryRequirements] = rsvpForm.attr(dataI18nDietaryRequirements);
        tokens[dataI18nDietaryRequirementsValidation] = rsvpForm.attr(dataI18nDietaryRequirementsValidation);
        tokens[dataI18nDietaryRequirementsPlaceholder] = rsvpForm.attr(dataI18nDietaryRequirementsPlaceholder);
        tokens[dataI18nStandard] = rsvpForm.attr(dataI18nStandard);
        tokens[dataI18nVegetarian] = rsvpForm.attr(dataI18nVegetarian);
        tokens[dataI18nAllergies] = rsvpForm.attr(dataI18nAllergies);
        tokens[dataI18nAllergiesPlaceholder] = rsvpForm.attr(dataI18nAllergiesPlaceholder);
        tokens.valName = person.name;
        tokens.valAllergies = person.allergies ? person.allergies : "";

        // Apply template
        const html = applyTemplate(personTemplateHtml, tokens).replace("/\s\s+/g", " ");
        $(html).insertBefore("#insertPeopleBefore");

        // Add onchange event to elements
        const sel = $(`#${comingId}${i}`);
        sel.on("change", function() {
            const coming = this.value == "true";
            const rsvpPerson = $(this).closest(`.${rsvpPersonClass}`);
            const dietSel = $(`#${dietId}${rsvpPerson.attr(indexAttr)}`);
            if (coming) {
                // Hide the unnecessary form fields
                rsvpPerson.addClass(rsvpYesClass);
                if (dietSel.val() == dietNotApplicable) {
                    // Set the value back to nothing for validation as it is currently not applicable
                    dietSel.val("");
                }
            } else {
                // Show the necessary form fields
                rsvpPerson.removeClass(rsvpYesClass);
                if (!dietSel.val()) {
                    dietSel.val(dietNotApplicable);
                }
            }
        });
    }
    if (rsvp.bacheloretteparty) {
        $("#chkBacheloretteParty").prop("checked", true);
    }
    if (rsvp.bachelorparty) {
        $("#chkBachelorParty").prop("checked", true);
    }
    $("#usertag").val(rsvp.usertag);
    $("#allowchildren").val(rsvp.allowchildren);

    $("#rsvpState").removeClass();
    $("#rsvpState").addClass("rsvp-ok");
}

function submitRsvp() {
    if ($("#rsvpForm")[0].checkValidity()) {
        // State
        $("#rsvpButton").addClass("btn-loading");

        // Build the JSON payload
        let body = {
            allowchildren: $("#allowchildren").val() == "true",
            bacheloretteparty: $("#chkBacheloretteParty").prop("checked"),
            bachelorparty: $("#chkBachelorParty").prop("checked"),
            people: $(".rsvp-person").toArray().map(function(elem) {
                const index = $(elem).attr(indexAttr);
                return {
                    name: $(`#${nameId}${index}`).val(),
                    rsvpResponse: $(`#${comingId}${index}`).val() == "true",
                    diet: $(`#${dietId}${index}`).val(),
                    allergies: $(`#${allergiesId}${index}`).val()
                };
            }),
            timestamp: Date.now(),
            usertag: $("#usertag").val()
        };

        // API Call
        fetch(`${apiHost}/rsvp/${body.usertag}`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(body)
        })
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`${response.status}`);
                }
            })
            .then(function(rsvp){
                loadRsvp(rsvp);
            })
            .catch(function (err) {
                switch (err.message) {
                    case "403":
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-forbidden");
                        break;
                    case "404":
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-notfound");
                        break;
                    default:
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-error");
                        break;
                }
            })
            .finally(function () {
                // State
                $("#rsvpButton").removeClass("btn-loading");
            });
    }
    $("#rsvpForm").addClass("was-validated");
}

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
                $("#rsvpForm").submit(function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    submitRsvp(event);
                });
                loadRsvp(rsvp);
            })
            .catch(function (err) {
                switch (err.message) {
                    case "403":
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-forbidden");
                        break;
                    case "404":
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-notfound");
                        break;
                    default:
                        $("#rsvpState").removeClass();
                        $("#rsvpState").addClass("rsvp-error");
                        break;
                }
            });
    } else {
        $("#rsvpState").removeClass();
        $("#rsvpState").addClass("rsvp-forbidden");
    }
}

// Maps
function initMaps() {
    let vilaVita = {lat: 37.101457, lng: -8.3824047, placeId: 'ChIJX4iNCUTRGg0RSrvhjFgQ3VE', image: '/img/reception-map-icon.png'};
    let ourLady = {lat: 37.1254143, lng: -8.4011588, placeId: 'ChIJ0UW4BtXWGg0R2XoubH9KSsk', image: '/img/ceremony-map-icon.png'};
    let places = [
        vilaVita,
        ourLady
    ];
    let center = {
        lat: places.reduce(function(a, b) { return a.lat + b.lat; })/places.length,
        lng: places.reduce(function(a, b) { return a.lng + b.lng; })/places.length,
    };
    let portugalBounds = {
        north: 42,
        south: 37,
        west: -10,
        east: -5,
    };

    // Set up map
    let map = new google.maps.Map($('#googleMap')[0], {
        center: center,
        restriction: {
            latLngBounds: portugalBounds,
            strictBounds: false,
        },
        zoom: 13
    });

    // Set up markers
    let vilaVitaMarker = new google.maps.Marker({
        position: vilaVita,
        map: map,
        icon: {
            url: vilaVita.image,
            size: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 0)
        }
    });
    let ourLadyMarker = new google.maps.Marker({
        position: ourLady,
        map: map,
        icon: {
            url: ourLady.image,
            size: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 0)
        }
    });
    vilaVitaMarker.addListener('click', function() {
        window.open("https://www.google.com/maps/search/?api=1&query=Vila+Vita+Parc,+Porches,+Portugal", "_blank");
    });
    ourLadyMarker.addListener('click', function() {
        window.open("https://www.google.com/maps/search/?api=1&query=Church+of+Our+Lady+of+the+Incarnation,+Porches,+Portugal", "_blank");
    });
}
