require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create CloudWatch Logs client
const cloudWatchLogs = new AWS.CloudWatchLogs();

// Utility function to get the timestamp for 30 days ago
const getTimestamp30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.getTime();
};

// Function to fetch all log streams for a given log group
const fetchLogStreams = async (logGroupName) => {
    let logStreams = [];
    let nextToken;

    do {
        const params = {
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
            limit: 50,
            nextToken,
        };

        const response = await cloudWatchLogs.describeLogStreams(params).promise();
        logStreams = logStreams.concat(response.logStreams);
        nextToken = response.nextToken;
    } while (nextToken);

    return logStreams;
};

// Function to fetch log events for a given log stream
const fetchLogEvents = async (logGroupName, logStreamName) => {
    let logEvents = [];
    let nextToken;
    // This could be implemented with a while loop, but we're storing one event per log stream 
    try {
        const params = {
            logGroupName,
            logStreamName,
            startTime: getTimestamp30DaysAgo(),
            nextToken,
        };

        const response = await cloudWatchLogs.getLogEvents(params).promise();
        logEvents = logEvents.concat(response.events);
        nextToken = response.nextForwardToken;
    } catch (error) {
        console.error('Error fetching log events:', error);
    }

    return logEvents;
};

const groupBy = (array, property) => {
    return array.reduce((result, item) => {
        // Get the value of the property we want to group by
        const key = item[property];

        // Initialize the group if it doesn't exist yet
        if (!result[key]) {
            result[key] = [];
        }

        // Add the item to the group
        result[key].push(item);

        return result;
    }, {});
};


// Main function to fetch and parse all events from CloudWatch logs
async function fetchAndParseLogs(logGroupName) {
    try {
        const logStreams = await fetchLogStreams(logGroupName);
        const transactionData = [];
        for (const logStream of logStreams) {
            const logEvents = await fetchLogEvents(logGroupName, logStream.logStreamName);
            logEvents.forEach(event => transactionData.push(JSON.parse(event.message).detail));
        }
        // get all accounts from the resultData
        const result = groupBy(transactionData, 'account');

        console.log(result);
        return result;
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
};

module.exports = { fetchAndParseLogs };