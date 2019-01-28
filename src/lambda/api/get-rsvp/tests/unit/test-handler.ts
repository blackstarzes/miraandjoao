import app = require("../../app.js");
import chai = require("chai");
import {APIGatewayEvent, Context} from "aws-lambda";

const expect = chai.expect;
let event: APIGatewayEvent;
let context: Context;


describe("Tests index", function () {
    it("verifies successful response", async () => {
        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an("object");
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an("string");

        let response = JSON.parse(result.body);

        expect(response).to.be.an("object");
        expect(response.message).to.be.equal("hello world");
    });
});