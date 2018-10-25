"use strict";

const AWS = require('aws-sdk');
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = (event, context, callback) => {
    // Should only receive one record
    let message = event.Records[0];

    // Load the message from the event (triggered by lambda)
    let params = JSON.parse(message.body);

    // Send the bulk email
    ses.sendBulkTemplatedEmail(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback("Error");
        } else {
            console.log(data); // successful sent

            // Analytics
            params.Destinations.forEach(function(item) {
                let analytics = {
                    usertag: JSON.parse(item.ReplacementTemplateData).usertag,
                    type: "emailsend",
                    attributes: {
                        template: params.Template
                    },
                };
                let sqsParams = {
                    MessageBody: JSON.stringify(analytics),
                    QueueUrl: process.env.analytics_queue_url
                };
                sqs.sendMessage(sqsParams, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                    } else {
                        console.log("Success", data.MessageId);
                    }
                });
            });

            callback(null, "Success");
        }
    });
};