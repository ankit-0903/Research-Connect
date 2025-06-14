const express = require('express');
const router = express.Router();
const downloadReportController = require('../controllers/downloadReportController');
const recordController = require('../controllers/recordController');
const isAuthenticated = require('../middleware/authMiddleware');

// Dashboard route
// router.get('/dashboard', isAuthenticated, (req, res) => {
//     // Fetch user data, e.g., from a database
//     const users = [
//       { name: 'John Doe', email: 'john.doe@example.com' },
//       { name: 'Jane Smith', email: 'jane.smith@example.com' },
//       // Add more users if needed
//     ];

//     // Make sure to pass the 'users' array to the view
//     res.render('dashboard', {
//       users: users, // passing the users array to the EJS template
//       alumniCount: 10, // Example: Pass any other dynamic data
//       higherStudiesCount: 5,
//       placedCount: 8,
//       entrepreneurCount: 3
//     });
// });
router.get('/dashboard',  recordController.getDashboard);

router.get('/dashboard/report/download', downloadReportController);

module.exports = router;
