const express = require('express');
const router = express.Router();
const reportsService = require('../service/reports');
const auth = require('../auth');


// Define a route to get all accounts
router.get('/reports', auth.authenticateToken, auth.authorizeRole(['admin']), async (req, res) => {
  try {
    // Specify the log group name you want to fetch logs from
    const logGroupName = '/aws/events/transactions';

    // Execute the main function
    const result = await reportsService.fetchAndParseLogs(logGroupName);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the router to use it in other files
module.exports = router;