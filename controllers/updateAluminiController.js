const { v4: uuidv4 } = require('uuid');
const Record = require('../models/recordModels');
const mongoose = require('mongoose');
require('dotenv').config();

// Email and database configurations, and UUID handling

exports.verifyToken = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is missing.' });
    }

    try {
        // Find the user by the UUID token
        const user = await Record.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid or expired token.' });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid. You can update your details.',
            data: {
                name: user.name,
                company: user.company,
                status: user.status,
                usn: user.usn,
                batch: user.batch
            }
        });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(500).json({ success: false, message: 'An error occurred while verifying the token.' });
    }
};

exports.submitUpdate = async (req, res) => {
    const { token, name, company, status } = req.body;

    if (!token || !name || !company || !status) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Find the user by the UUID token
        const user = await Record.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Update the user's details
        await Record.findByIdAndUpdate(user._id, {
            name,
            company,
            status,
            dateUpdated: moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
            resetToken: null,
            resetTokenExpiration: null,
            requestUpdate: "Request Update"
        });

        res.status(200).json({ success: true, message: 'Your details have been updated successfully!' });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating your details.' });
    }
};

// Function to generate and send a UUID token for update request email
exports.sendUpdateRequestEmail = async (userEmail, userName, userId) => {
    try {
        // Generate a UUID token
        const token = uuidv4();
        console.log('Generated Token:', token);

        // Set token expiration (1 hour)
        const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds

        // Store the token and expiration in the database
        const user = await Record.findOne({ _id: userId });
        user.resetToken = token;
        user.resetTokenExpiration = expirationTime;
        await user.save();

        // Construct the URL with the token
        const link = `http://localhost:5000/update?token=${token}`;

        // Email configuration
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: 'asim.dev.cs@gmail.com', // Replace with your email
                pass: 'jxfe ibxp reoa hlnw', // Replace with your email password
            },
        });

        const mailOptions = {
            from: 'asim.dev.cs@gmail.com',
            to: userEmail,
            subject: 'Request to Update Alumni Information',
            html: `
                <p>Dear ${userName},</p>
                <p>We request you to update your alumni details in our system. Please click the link below to update your information:</p>
                <p><a href="${link}">Update Your Details</a></p>
                <p>If you did not request an update, please ignore this email.</p>
                <p>Thank you!</p>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return { success: true, message: 'Update request email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: error.message };
    }
};
