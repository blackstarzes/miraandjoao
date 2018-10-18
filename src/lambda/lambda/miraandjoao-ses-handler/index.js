const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({apiVersion: '2010-12-01'});

exports.handler = (event, context, callback) => {

    // Fetch the recipients from dynamodb and add to bulkParams
    let scanParams = {
        TableName: event.source.tableName,
        ProjectionExpression: event.source.projectionExpression,
        ExpressionAttributeNames: event.source.expressionAttributeNames,
        Limit: event.ratePerSecond
    };

    let uuidv4 = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let onScan = function(err, data) {

        // Build bulkParams from items
        let templates = [];
        let bulkParams = {};
        data.Items.forEach(function(item) {
            // Check if the template exists in the dictionary
            let template = event.mail.templatePrefix + item[event.mapping.templateSuffixField];
            if (!bulkParams[template]) {
                templates.push(template);
                bulkParams[template] = {
                    Destinations: [],
                    Source: event.mail.source,
                    Template: template,
                    ConfigurationSetName: event.mail.configurationSetName,
                    DefaultTags: event.mail.tags,
                    DefaultTemplateData: "{}"
                };
            }

            let templateData = {};
            if (event.mapping.generatedCidToken) {
                templateData[event.mapping.generatedCidToken] = uuidv4();
            }
            event.mapping.tokenMapping.forEach(function(mapping) {
                templateData[mapping.destination] = item[mapping.source];
            });
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
            bulkParams[template].Destinations.push(destination);
        });

        console.log(JSON.stringify(bulkParams, null, 4));
        // Send email
        /*ses.sendBulkTemplatedEmail(bulkParams, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(err);
            } else {
                console.log(data); // successful response
                callback(null, data);
            }
        });*/

        // continue scanning if we have more users, because scan can retrieve a maximum of the lower of
        // * 1MB of data
        // * number of items in ratePerSecond
        if (typeof data.LastEvaluatedKey != "undefined") {
            scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
            console.log(`Rate limiting at ${event.ratePerSecond}/s...`);
            setTimeout(function() {
                console.log("Scanning for more...");
                ddb.scan(scanParams, onScan);
            }, 1000);
        }
    };
    ddb.scan(scanParams, onScan);
};