import AWS = require('aws-sdk');
import {APIGatewayEvent, Context, ProxyResult} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import QueryInput = DocumentClient.QueryInput;

import {Rsvp} from "../../miraandjoao-lib/models/rsvp";
import {RsvpDetails} from "../../miraandjoao-lib/models/rsvpdetails";
import {User} from "../../miraandjoao-lib/models/user";

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
            // Fetch the latest RSVP from the table
            console.log("Fetching RSVP from table...");
            const rsvpQueryParams: QueryInput = {
                TableName: rsvpsTableName,
                KeyConditionExpression: "#usertag = :usertag",
                ExpressionAttributeNames: {
                    "#usertag": "usertag"
                },
                ExpressionAttributeValues: {
                    ":usertag": userTag
                },
                ScanIndexForward: true,
                Limit: 1
            };
            let rsvpQueryResult = await dynamoDb.query(rsvpQueryParams).promise();
            if (rsvpQueryResult.Count != 0) {
                // Return this RSVP response
                console.log("RSVP found");
                response = {
                    statusCode: 200,
                    body: JSON.stringify(<Rsvp>rsvpQueryResult.Items![0])
                }
            } else {
                console.log("RSVP not found");

                // Fetch the user and return an RSVP response
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

                    // Build an RSVP from the user
                    const user = <User> userQueryResult.Items![0];
                    const people = user.invitednames
                        .replace(" and ", ", ")
                        .replace(" и ", ", ")
                        .split(",")
                        .map(function (item) {
                            const person: RsvpDetails = {
                                name: item.trim()
                            };
                            return person;
                        });
                    const rsvp: Rsvp = {
                        usertag: user.usertag,
                        people: people,
                        allowchildren: user.allowchildren
                    };
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(rsvp)
                    };
                } else {
                    console.log("User not found");

                    response = {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: "UserTag not found"
                        })
                    };
                }
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
        "access-control-allow-origin": process.env.HEADER_ACAO!
    };

    return response;
};