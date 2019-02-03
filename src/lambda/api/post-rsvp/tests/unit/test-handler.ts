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

// Test framework
const expect = chai.expect;

// Constants
const DOMAIN_UI = "https://www.example.com";
const RSVPS_TABLE_NAME = "rsvp-table";
const USERS_TABLE_NAME = "user-table";
const USERS_TABLE_USERTAG_INDEX_NAME = "user-table-usertag-index";
let context: Context;

// Tests
describe("Post RSVP tests", function () {
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
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("UserTag not provided");
    });

    it("When UserTag is provided and no payload is provided, should return 500 with message 'Unhandled exception'", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == USERS_TABLE_NAME
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
        expect(result.statusCode).to.equal(500);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("Unhandled exception");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided and payload is the wrong structure, should return 400 with message 'RSVP invalid'", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == USERS_TABLE_NAME
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
                body: JSON.stringify({
                    "junk": "junk"
                }),
                pathParameters: {
                    "usertag": "abc123"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(400);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("RSVP invalid");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, payload is the correct structure and User does not exist, should return 404 with message 'UserTag not found'", async () => {
        // Given
        process.env.RSVPS_TABLE_NAME = RSVPS_TABLE_NAME;
        process.env.USERS_TABLE_NAME = USERS_TABLE_NAME;
        process.env.USERS_TABLE_USERTAG_INDEX_NAME = USERS_TABLE_USERTAG_INDEX_NAME;
        AWS.mock("DynamoDB.DocumentClient", "query", function (params: QueryInput, callback: any) {
            if (params.TableName == USERS_TABLE_NAME
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
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                body: JSON.stringify(rsvp),
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
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("UserTag not found");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, payload is the correct structure, invalid for the user and User does exist, should return 400 with message 'RSVP invalid'", async () => {
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
                && params.ScanIndexForward
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
        AWS.mock("DynamoDB.DocumentClient", "put", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME) {
                const response: DocumentClient.PutItemOutput = {};
                callback(null, response);
            }
        });
        const rsvp: any = {
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
                rsvpResponse: true,
                allergies: "Peanuts"
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                body: JSON.stringify(rsvp),
                pathParameters: {
                    "usertag": "abc123"
                }
            }
        });

        // When
        const result = await app.lambdaHandler(event, context);

        // Then
        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(400);
        expect(result.body).to.be.an("string");
        expect(result.headers).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.not.be.null;
        expect(result.headers!["access-control-allow-origin"]).to.be.equal(DOMAIN_UI);
        let response = JSON.parse(result.body);
        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("RSVP invalid");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });

    it("When UserTag is provided, payload is the correct structure, valid for the user and User does exist, should return 200 with RSVP as the body", async () => {
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
                && params.ScanIndexForward
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
        AWS.mock("DynamoDB.DocumentClient", "put", function (params: QueryInput, callback: any) {
            if (params.TableName == RSVPS_TABLE_NAME) {
                const response: DocumentClient.PutItemOutput = {};
                callback(null, response);
            }
        });
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
                rsvpResponse: true,
                allergies: "Peanuts"
            }],
            timestamp: 123456,
            usertag: "abc123"
        };
        let event: APIGatewayEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                body: JSON.stringify(rsvp),
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
        expect(typedResponse.people[0].diet).to.be.equal(Diet.Standard);
        expect(typedResponse.people[0].rsvpResponse).to.be.true;
        expect(typedResponse.people[0].allergies).to.be.undefined;
        expect(typedResponse.people[1]).to.not.be.null;
        expect(typedResponse.people[1].name).to.be.equal("Jane");
        expect(typedResponse.people[1].diet).to.be.equal(Diet.Vegetarian);
        expect(typedResponse.people[1].rsvpResponse).true;
        expect(typedResponse.people[1].allergies).to.be.equal("Peanuts");
        expect(typedResponse.timestamp).to.approximately(Date.now(), 1000);
        expect(typedResponse.usertag).to.be.equal("abc123");

        // Cleanup
        AWS.restore("DynamoDB.DocumentClient");
    });
});