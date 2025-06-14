const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { upload } = require('../middleware/uploadMiddleware');
const isAuthenticated  = require('../middleware/authMiddleware');
const requestUpdateController = require('../controllers/requestUpdateController');

// Upload route with proper middleware chain
router.post('/upload',upload.single('file'), recordController.uploadExcel);

// Dashboard route


// Records API route
router.get('/records',recordController.getRecords);
router.post('/request-update',requestUpdateController.requestUpdate);
module.exports = router;