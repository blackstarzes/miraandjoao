const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = (event, context, callback) => {

    // Fetch the recipients from dynamodb and add to templates
    let scanParams = {
        TableName: event.source.tableName,
        ProjectionExpression: event.source.projectionExpression,
        ExpressionAttributeNames: event.source.expressionAttributeNames
    };

    let uuidv4 = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Build queue messages from items
    let messages = [];
    let templates = {};

    let onScan = function(err, data) {
        // Check for errors
        if (err) {
            console.log("Error", err.stack); // an error occurred
            callback("Error");
            return;
        }
        data.Items.forEach(function(item) {
            // Check if the template exists in the dictionary
            let template = event.mail.templatePrefix + item[event.mapping.templateSuffixField];
            if (!templates[template]) {
                templates[template] = {
                    Destinations: [],
                    Source: event.mail.source,
                    Template: template,
                    ConfigurationSetName: event.mail.configurationSetName,
                    DefaultTags: event.mail.tags,
                    DefaultTemplateData: "{}"
                };
            }

            // Generate template data
            let templateData = {};
            if (event.mapping.generatedCidToken) {
                templateData[event.mapping.generatedCidToken] = uuidv4();
            }
            event.mapping.tokenMapping.forEach(function(mapping) {
                templateData[mapping.destination] = item[mapping.source];
            });

            // Add destination with template data
            let emailAddress = event.mail.isTest
                ? event.mail.testAddress
                : item[event.mapping.emailAddressField];
            let destination = {
                Destination: {
                    ToAddresses: [
                        `${item[event.mapping.friendlyNameField]} <${emailAddress}>`
                    ]
                },
                ReplacementTemplateData: JSON.stringify(templateData)
            };
            templates[template].Destinations.push(destination);
            if (templates[template].Destinations.length == event.batchSize) {
                messages.push(templates[template]);
                templates[template] = null;
            }
        });

        // Continue scanning if we have more users, because scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
            ddb.scan(scanParams, onScan);
        } else {
            messages.forEach(function(message, index){
                let params = {
                    DelaySeconds: index,
                    MessageAttributes: {
                        "BatchSize": {
                            DataType: "Number",
                            StringValue: `${messages.length}`
                        },
                        "BatchNumber": {
                            DataType: "Number",
                            StringValue: `${index}`
                        },
                        "Template": {
                            DataType: "String",
                            StringValue: message.Template
                        },
                        "Recipients": {
                            DataType: "Number",
                            StringValue: `${message.Destinations.length}`
                        }
                    },
                    MessageBody: JSON.stringify(message),
                    QueueUrl: process.env.queue_url
                };

                sqs.sendMessage(params, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                        callback("Error");
                    } else {
                        console.log("Success", data.MessageId);
                    }
                });
            });
            callback(null, "Success!");
        }
    };

    ddb.scan(scanParams, onScan);
};