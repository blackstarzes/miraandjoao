// Test subject
import app = require("../../app.js");

// External libraries
import chai from "chai";
const createEvent = require("aws-event-mocks");
import {APIGatewayEvent, Context} from "aws-lambda";
import AWS from 'aws-sdk-mock';
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import QueryInput = DocumentClient.QueryInput;

// Local libraries
import {Rsvp} from "../../miraandjoao-lib/models/rsvp";
import {User} from "../../miraandjoao-lib/models/user";
import {Diet} from "../../miraandjoao-lib/models/diet";
import GetItemInput = DocumentClient.GetItemInput;

// Test framework
const expect = chai.expect;

// Constants
const DOMAIN_UI = "https://www.example.com";
const RSVPS_TABLE_NAME = "rsvp-table";
const USERS_TABLE_NAME = "user-table";
const USERS_TABLE_USERTAG_INDEX_NAME = "user-table-usertag-index";
let context: Context;

// Tests
describe("Get RSVP tests", function () {
    it("When UserTag is not provided, should return 403 with message 'UserTag not provided'", async () => {
        // Given
        process.env.HEADER_ACAO = DOMAIN_UI;
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway"
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(403);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("UserTag not provided");
    });

    it("When UserTag is provided, User exists and RSVP exists, should return 200 with RSVP as the body", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && !params.ScanIndexForward
                && params.Limit == 1) {
                const rsvp: Rsvp = {
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
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [rsvp]
                };
                callback(null, response);
            } else if (params.TableName == USERS_TABLE_NAME
                && params.IndexName == USERS_TABLE_USERTAG_INDEX_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && params.Limit == 1) {
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
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [user]
                };
                callback(null, response);
            }
        });
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    "usertag": "abc123"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        let typedResponse = <Rsvp> response;
        expect(typedResponse.allowchildren).to.be.equal(true);
        expect(typedResponse.bacheloretteparty).to.be.equal(true);
        expect(typedResponse.bachelorparty).to.be.equal(true);
        expect(typedResponse.people).to.not.be.null;
        expect(typedResponse.people.length).to.be.equal(2);
        expect(typedResponse.people[0]).to.not.be.null;
        expect(typedResponse.people[0].name).to.be.equal("John");
        expect(typedResponse.people[0].diet).to.be.equal(Diet.Standard);
        expect(typedResponse.people[0].rsvpResponse).to.be.equal(true);
        expect(typedResponse.people[0].allergies).to.be.equal("Eggs");
        expect(typedResponse.people[1]).to.not.be.null;
        expect(typedResponse.people[1].name).to.be.equal("Jane");
        expect(typedResponse.people[1].diet).to.be.equal(Diet.Vegetarian);
        expect(typedResponse.people[1].rsvpResponse).to.be.equal(true);
        expect(typedResponse.people[1].allergies).to.be.equal("");
        expect(typedResponse.timestamp).to.be.equal(123456);
        expect(typedResponse.usertag).to.be.equal("abc123");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, RSVP does not exist and User does not exist, should return 404 with message 'UserTag not found'", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && !params.ScanIndexForward
                && params.Limit == 1) {
                const response: DocumentClient.QueryOutput = {
                    Count: 0,
                    Items: []
                };
                callback(null, response);
            } else if (params.TableName == USERS_TABLE_NAME
                && params.IndexName == USERS_TABLE_USERTAG_INDEX_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && params.Limit == 1) {
                const response: DocumentClient.QueryOutput = {
                    Count: 0,
                    Items: []
                };
                callback(null, response);
            }
        });
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    "usertag": "abc123"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(404);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("UserTag not found");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, RSVP does not exist and User exists, should return 200 with RSVP as the body", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && !params.ScanIndexForward
                && params.Limit == 1) {
                const response: DocumentClient.QueryOutput = {
                    Count: 0,
                    Items: []
                };
                callback(null, response);
            } else if (params.TableName == USERS_TABLE_NAME
                && params.IndexName == USERS_TABLE_USERTAG_INDEX_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && params.Limit == 1) {
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
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [user]
                };
                callback(null, response);
            }
        });
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    "usertag": "abc123"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        let typedResponse = <Rsvp> response;
        expect(typedResponse.allowchildren).to.be.equal(true);
        expect(typedResponse.bacheloretteparty).to.be.true;
        expect(typedResponse.bachelorparty).to.be.true;
        expect(typedResponse.people).to.not.be.null;
        expect(typedResponse.people.length).to.be.equal(2);
        expect(typedResponse.people[0]).to.not.be.null;
        expect(typedResponse.people[0].name).to.be.equal("John");
        expect(typedResponse.people[0].diet).to.be.undefined;
        expect(typedResponse.people[0].rsvpResponse).to.be.undefined;
        expect(typedResponse.people[0].allergies).to.be.undefined;
        expect(typedResponse.people[1]).to.not.be.null;
        expect(typedResponse.people[1].name).to.be.equal("Jane");
        expect(typedResponse.people[1].diet).to.be.undefined;
        expect(typedResponse.people[1].rsvpResponse).undefined;
        expect(typedResponse.people[1].allergies).to.be.undefined;
        expect(typedResponse.timestamp).to.be.undefined;
        expect(typedResponse.usertag).to.be.equal("abc123");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, User exists, User is linked and RSVP does not exist should return 200 with linked RSVP as the body", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && !params.ScanIndexForward
                && params.Limit == 1) {
                const response: DocumentClient.QueryOutput = {
                    Count: 0,
                    Items: []
                };
                callback(null, response);
            } else if (params.TableName == USERS_TABLE_NAME
                && params.IndexName == USERS_TABLE_USERTAG_INDEX_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "def456"
                && params.Limit == 1) {
                const user: User = {
                    allowchildren: true,
                    delivered: {
                        savethedate: true
                    },
                    invitedcount: 2,
                    invitednames: "Jane and John",
                    language: "en",
                    linkeduserid: "johnandjane@example.com",
                    rsvpcount: 0,
                    salutation: "Dear",
                    userid: "jane@example.com",
                    usertag: "def456"
                };
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [user]
                };
                callback(null, response);
            }
        });
        AWS.mock("DynamoDB.DocumentClient", "get", function (params: GetItemInput, callback: any) {
            if (params.TableName == USERS_TABLE_NAME
                && params.Key["userid"] == "johnandjane@example.com") {
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
                const response: DocumentClient.GetItemOutput = {
                    Item: user
                };
                callback(null, response);
            }
        });
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    "usertag": "def456"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        let typedResponse = <Rsvp> response;
        expect(typedResponse.allowchildren).to.be.equal(true);
        expect(typedResponse.bacheloretteparty).to.be.true;
        expect(typedResponse.bachelorparty).to.be.true;
        expect(typedResponse.people).to.not.be.null;
        expect(typedResponse.people.length).to.be.equal(2);
        expect(typedResponse.people[0]).to.not.be.null;
        expect(typedResponse.people[0].name).to.be.equal("John");
        expect(typedResponse.people[0].diet).to.be.undefined;
        expect(typedResponse.people[0].rsvpResponse).to.be.undefined;
        expect(typedResponse.people[0].allergies).to.be.undefined;
        expect(typedResponse.people[1]).to.not.be.null;
        expect(typedResponse.people[1].name).to.be.equal("Jane");
        expect(typedResponse.people[1].diet).to.be.undefined;
        expect(typedResponse.people[1].rsvpResponse).undefined;
        expect(typedResponse.people[1].allergies).to.be.undefined;
        expect(typedResponse.timestamp).to.be.undefined;
        expect(typedResponse.usertag).to.be.equal("abc123");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, User exists, User is linked and RSVP exists should return 200 with linked RSVP as the body", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "abc123"
                && !params.ScanIndexForward
                && params.Limit == 1) {
                const rsvp: Rsvp = {
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
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [rsvp]
                };
                callback(null, response);
            } else if (params.TableName == USERS_TABLE_NAME
                && params.IndexName == USERS_TABLE_USERTAG_INDEX_NAME
                && params.KeyConditionExpression == "#usertag = :usertag"
                && params.ExpressionAttributeNames!.hasOwnProperty("#usertag")
                && params.ExpressionAttributeNames!["#usertag"] == "usertag"
                && params.ExpressionAttributeValues!.hasOwnProperty(":usertag")
                && params.ExpressionAttributeValues![":usertag"] == "def456"
                && params.Limit == 1) {
                const user: User = {
                    allowchildren: true,
                    delivered: {
                        savethedate: true
                    },
                    invitedcount: 2,
                    invitednames: "Jane and John",
                    language: "en",
                    linkeduserid: "johnandjane@example.com",
                    rsvpcount: 0,
                    salutation: "Dear",
                    userid: "jane@example.com",
                    usertag: "def456"
                };
                const response: DocumentClient.QueryOutput = {
                    Count: 1,
                    Items: [user]
                };
                callback(null, response);
            }
        });
        AWS.mock("DynamoDB.DocumentClient", "get", function (params: GetItemInput, callback: any) {
            if (params.TableName == USERS_TABLE_NAME
                && params.Key["userid"] == "johnandjane@example.com") {
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
                const response: DocumentClient.GetItemOutput = {
                    Item: user
                };
                callback(null, response);
            }
        });
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    "usertag": "def456"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        expect(result.headers!["content-type"]).to.not.be.null;
        expect(result.headers!["content-type"]).to.be.equal("application/json");
        expect(result.headers!["x-content-type-options"]).to.not.be.null;
        expect(result.headers!["x-content-type-options"]).to.be.equal("nosniff");
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        let typedResponse = <Rsvp> response;
        expect(typedResponse.allowchildren).to.be.equal(true);
        expect(typedResponse.bacheloretteparty).to.be.equal(true);
        expect(typedResponse.bachelorparty).to.be.equal(true);
        expect(typedResponse.people).to.not.be.null;
        expect(typedResponse.people.length).to.be.equal(2);
        expect(typedResponse.people[0]).to.not.be.null;
        expect(typedResponse.people[0].name).to.be.equal("John");
        expect(typedResponse.people[0].diet).to.be.equal(Diet.Standard);
        expect(typedResponse.people[0].rsvpResponse).to.be.equal(true);
        expect(typedResponse.people[0].allergies).to.be.equal("Eggs");
        expect(typedResponse.people[1]).to.not.be.null;
        expect(typedResponse.people[1].name).to.be.equal("Jane");
        expect(typedResponse.people[1].diet).to.be.equal(Diet.Vegetarian);
        expect(typedResponse.people[1].rsvpResponse).to.be.equal(true);
        expect(typedResponse.people[1].allergies).to.be.equal("");
        expect(typedResponse.timestamp).to.be.equal(123456);
        expect(typedResponse.usertag).to.be.equal("abc123");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });
});