// Test subject

// External libraries
import chai from "chai";
import {isRsvp, isValidRsvpForUser, Rsvp} from "../../src/models/rsvp";
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
                diet: "Standard",
                rsvpResponse: true,
                allergies: "Eggs"
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When a test object is a valid Rsvp, isRsvp should return true", async () => {
        // Given
        const rsvp: any = JSON.parse("{\"allowchildren\":false,\"bacheloretteparty\":false,\"bachelorparty\":false,\"people\":[{\"name\":\"Joao\",\"rsvpResponse\":true,\"diet\":\"Standard\",\"allergies\":\"Wild mushrooms\"}],\"timestamp\":1549193460665,\"usertag\":\"a70745e5-58f5-4f28-80cd-8d4acd4fb7cb\"}");

        // When
        let result = isRsvp(rsvp);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.true;
    });

    it("When an object is a valid Rsvp with a yes response and a NotApplicable diet, isRsvp should return false", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "NotApplicable",
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };

        // When
        let result = isRsvp(rsvp);

        // Then
        expect(result).to.be.an("boolean");
        expect(result).to.be.false;
    });

    it("When an object is a valid Rsvp with a no response and a NotApplicable diet, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "NotApplicable",
                rsvpResponse: false
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

    it("When an object is a valid Rsvp with a no response and a non-NotApplicable diet, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
                rsvpResponse: false
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
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When an object is a valid Rsvp with null accommodationprovided, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: null,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true,
                allergies: "Eggs"
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When an object is a valid Rsvp with numeric accommodationprovided, isRsvp should return true", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: 1,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true,
                allergies: "Eggs"
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When an RSVP matches all people in the User, isValidRsvpForUser should return true", async () => {
        // Given
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
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
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jen",
                diet: "Vegetarian",
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
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
                rsvpResponse: true
            }, {
                name: "Jen",
                diet: "Vegetarian",
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
        const rsvp: any = {
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
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

    it("When an RSVP accommodation and User accommodation matches, isValidRsvpForUser should return true", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: 2,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            accommodationprovided: 2,
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

    it("When an RSVP accommodation is 0 and User does not have accommodation, isValidRsvpForUser should return true", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: 0,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When an RSVP has accommodation and User does not, isValidRsvpForUser should return false", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: 2,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
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

    it("When an RSVP accommodation does not match User accommodation, isValidRsvpForUser should return false", async () => {
        // Given
        const rsvp: any = {
            accommodationprovided: 2,
            allowchildren: true,
            bacheloretteparty: true,
            bachelorparty: true,
            people: [{
                name: "John",
                diet: "Standard",
                rsvpResponse: true
            }, {
                name: "Jane",
                diet: "Vegetarian",
                rsvpResponse: true
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        const user: User = {
            accommodationprovided: 1,
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