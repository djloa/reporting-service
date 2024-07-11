const axios = require('axios');

// Sadly I was not able to go forward with the lambda approach for this project, because AWS wanted KYC documentation to allow the usage of lambda functions in my account.
// But will leave here the code for a handler to forward Event Bridge events to an HTTP endpoint
exports.handler = async (event) => {
    try {
        console.log("Received Event:", JSON.stringify(event, null, 2));

        // Extract necessary information from the event
        const dataToSend = extractData(event);

        // Public IP of the HTTP endpoint
        const url = 'http://16.170.232.85:8080/reports';

        // Send the HTTP POST request
        const response = await axios.post(url, dataToSend);

        console.log('Response from HTTP endpoint:', response.data);

        return {
            statusCode: 200,
            body: JSON.stringify('Event forwarded successfully')
        };
    } catch (error) {
        console.error('Error forwarding event:', error);

        return {
            statusCode: 500,
            body: JSON.stringify('Error forwarding event')
        };
    }
};

function extractData(event) {
    return {
        detail: event.detail,
        source: event.source,
        time: event.time,
    };
}