const AWS = require('aws-sdk');
const ses = new AWS.SES({apiVersion: '2010-12-01'});

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
            callback(null, "Success");
        }
    });
};