const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = (event, context, callback) => {
    if (event.request.userAttributes.hasOwnProperty("email")) {
        // Extract email address from request
        let email = event.request.userAttributes.email;

        // Query DynamoDB for invitation
        const params = {
            TableName: process.env.dynamodb_table,
            Key: {
                userid: email
            }
        };
        ddb.get(params, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                if (!data.Item) {
                    // Invalid email address - do not confirm
                    callback(": no invitation found for this email address");
                } else {
                    // Update request data
                    event.request.userAttributes["custom:invited-names"] = data.Item.invitednames;
                    event.request.userAttributes["custom:invited-count"] = data.Item.invitedcount;
                    event.request.userAttributes["custom:rsvp-count"] = data.Item.rsvpcount;
                    event.request.userAttributes["custom:allow-children"] = data.Item.allowchildren;
                    event.request.userAttributes["custom:language"] = data.Item.language;

                    // Auto confirm and verify
                    event.response.autoConfirmUser = true;
                    event.response.autoVerifyEmail = true;
                }
            }

            // Return to Amazon Cognito
            callback(null, event);
        });
    } else {
        // Email address required
        callback(" : email address required");
    }
};