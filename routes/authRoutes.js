const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to destroy session' });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: false, // Set to true in production when using HTTPS
            path: '/',
        });

        // Send a success response to indicate that the logout was successful
        res.json({ message: 'Logged out successfully' });
    });
});


module.exports = router;
