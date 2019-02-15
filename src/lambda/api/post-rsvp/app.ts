import AWS = require('aws-sdk');
import {APIGatewayEvent, Context, ProxyResult} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import PutItemInput = DocumentClient.PutItemInput;
import QueryInput = DocumentClient.QueryInput;

import {isRsvp, isValidRsvpForUser, Rsvp} from "./miraandjoao-lib/models/rsvp";
import {User} from "./miraandjoao-lib/models/user";

export const lambdaHandler = async (event: APIGatewayEvent, context: Context) => {

    // AWS services (create here so that aws-sdk-mock works)
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const rsvpsTableName: string = process.env.RSVPS_TABLE_NAME!;
    const usersTableName: string = process.env.USERS_TABLE_NAME!;
    const usersTableUserTagIndexName: string = process.env.USERS_TABLE_USERTAG_INDEX_NAME!;

    // Prepare the response
    let response: ProxyResult;

    try {
        // Extract the user tag from the path
        const userTag: string = event.pathParameters == null
            ? ""
            : event.pathParameters!["usertag"];
        if (userTag == null || userTag == "") {
            // Return UserId not provided
            console.log("UserTag not provided");
            response = {
                statusCode: 403,
                body: JSON.stringify({
                    message: "UserTag not provided"
                })
            };
        } else {
            // Validate RSVP structure
            console.log("Validating RSVP...");
            console.log(`UserTag: ${userTag}`);
            console.log(`Payload: ${event.body}`);
            const body = JSON.parse(event.body!);
            if (body != null && isRsvp(body)) {
                console.log("RSVP valid");

                // Cast payload to RSVP
                const rsvp: Rsvp = <Rsvp> body;

                // Fetch the user
                console.log("Fetching user from table...");
                const userQueryParams: QueryInput = {
                    TableName: usersTableName,
                    IndexName: usersTableUserTagIndexName,
                    KeyConditionExpression: "#usertag = :usertag",
                    ExpressionAttributeNames: {
                        "#usertag": "usertag"
                    },
                    ExpressionAttributeValues: {
                        ":usertag": userTag
                    },
                    Limit: 1
                };
                let userQueryResult = await dynamoDb.query(userQueryParams).promise();
                if (userQueryResult.Count != 0) {
                    console.log("User found");

                    // Validate RSVP against the User
                    const user = <User>userQueryResult.Items![0];
                    console.log("Validating RSVP against User...");
                    if (isValidRsvpForUser(rsvp, user)) {
                        console.log("RSVP valid against User");

                        // Overwrite content that is calculated server-side
                        rsvp.usertag = userTag;
                        rsvp.timestamp = Date.now();
                        rsvp.allowchildren = user.allowchildren;
                        if (user.accommodationprovided != undefined && user.accommodationprovided != null) {
                            rsvp.accommodationprovided = user.accommodationprovided;
                        }
                        for (let i=0; i<rsvp.people.length; i++) {
                            if (rsvp.people[i].allergies == "") {
                                rsvp.people[i].allergies = undefined;
                            }
                        }

                        // Persist RSVP
                        const params: PutItemInput = {
                            TableName: rsvpsTableName,
                            Item: rsvp
                        };
                        await dynamoDb.put(params).promise();
                        response = {
                            statusCode: 200,
                            body: JSON.stringify(rsvp)
                        };
                    } else {
                        console.log("RSVP invalid against User");
                        response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: "RSVP invalid"
                            })
                        };
                    }
                } else {
                    console.log("User not found");
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: "UserTag not found"
                        })
                    };
                }
            } else {
                console.log("RSVP invalid");
                response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "RSVP invalid"
                    })
                };
            }
        }
    } catch (err) {
        // Log the error
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: "Unhandled exception"
            })
        };
    }

    response.headers = {
        "access-control-allow-origin": process.env.HEADER_ACAO!,
        "content-type": "application/json",
        "x-content-type-options": "nosniff"
    };

    return response;
};