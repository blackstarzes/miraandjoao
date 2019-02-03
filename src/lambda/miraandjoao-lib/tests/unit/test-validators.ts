// Test subject

// External libraries
import chai from "chai";
import {isRsvp, isValidRsvpForUser, Rsvp} from "../../src/models/rsvp";
import {Diet} from "../../src/models/diet";
import {User} from "../../src/models/user";

// Local libraries

// Test framework
const expect = chai.expect;

// Constants

// Tests
describe("miraandjoao-lib tests", function () {
    it("When an object is an invalid Rsvp, isRsvp should return false", async () => {
        // Given
        const junk = {
            abc: "abc"
        };

        // When
        let result = isRsvp(junk);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.false;
    });

    it("When an object is a valid Rsvp, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true,
                allergies: "Eggs"
            }, {
                name: "Jane",
                diet: Diet.Vegetarian,
                rsvpResponse: true,
                allergies: ""
            }],
            timestamp: 123456,
            usertag: "abc123"
        };

        // When
        let result = isRsvp(rsvp);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.true;
    });

    it("When an object is a valid Rsvp without allergies, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: Diet.Vegetarian,
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };

        // When
        let result = isRsvp(rsvp);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.true;
    });

    it("When an RSVP matches all people in the User, isValidRsvpForUser should return true", async () => {
        // Given
        const rsvp: Rsvp = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: Diet.Vegetarian,
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            allowchildren: true,
            delivered: {
                savethedate: true
            },
            invitedcount: 2,
            invitednames: "John and Jane",
            language: "en",
            rsvpcount: 0,
            salutation: "Dear",
            userid: "johnandjane@example.com",
            usertag: "abc123"
        };

        // When
        let result = isValidRsvpForUser(rsvp, user);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.true;
    });

    it("When an RSVP has a different name than the names in the User, isValidRsvpForUser should return false", async () => {
        // Given
        const rsvp: Rsvp = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true
            }, {
                name: "Jen",
                diet: Diet.Vegetarian,
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            allowchildren: true,
            delivered: {
                savethedate: true
            },
            invitedcount: 2,
            invitednames: "John and Jane",
            language: "en",
            rsvpcount: 0,
            salutation: "Dear",
            userid: "johnandjane@example.com",
            usertag: "abc123"
        };

        // When
        let result = isValidRsvpForUser(rsvp, user);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.false;
    });

    it("When an RSVP has an additional name to the names in the User, isValidRsvpForUser should return false", async () => {
        // Given
        const rsvp: Rsvp = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: Diet.Vegetarian,
                rsvpResponse: true
            }, {
                name: "Jen",
                diet: Diet.Vegetarian,
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            allowchildren: true,
            delivered: {
                savethedate: true
            },
            invitedcount: 2,
            invitednames: "John and Jane",
            language: "en",
            rsvpcount: 0,
            salutation: "Dear",
            userid: "johnandjane@example.com",
            usertag: "abc123"
        };

        // When
        let result = isValidRsvpForUser(rsvp, user);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.false;
    });

    it("When an RSVP has left out a name that is in the User, isValidRsvpForUser should return false", async () => {
        // Given
        const rsvp: Rsvp = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: Diet.Standard,
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            allowchildren: true,
            delivered: {
                savethedate: true
            },
            invitedcount: 2,
            invitednames: "John and Jane",
            language: "en",
            rsvpcount: 0,
            salutation: "Dear",
            userid: "johnandjane@example.com",
            usertag: "abc123"
        };

        // When
        let result = isValidRsvpForUser(rsvp, user);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.false;
    });
});