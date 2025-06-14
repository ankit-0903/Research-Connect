const Record = require('../models/recordModels'); // Updated model
const EmailService = require('../services/emailService'); // Email service module

exports.requestUpdate = async (req, res) => {
    console.log('Request Body:', req.body); // Log the request body to check the data

    const { usn } = req.body;

    if (!usn) {
        return res.status(400).json({ success: false, message: 'USN is required' });
    }

    try {
        const user = await Record.findOne({ usn }); 
        console.log('User found:', user); // Ensure the query is correctly looking up the record
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('Email to send:', user.email);
        if (!user.email) {
            return res.status(400).json({ success: false, message: 'Email is not defined for this user.' });
        }
       
        const emailResponse = await EmailService.sendUpdateRequestEmail(user.email, user.name);
        if (emailResponse.success) {
            return res.json({ success: true, message: 'Update request email sent successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send email.' });
        }
    } catch (error) {
        console.error('Error in requestUpdate:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
};
