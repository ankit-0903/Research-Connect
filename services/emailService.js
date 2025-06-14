const nodemailer = require('nodemailer');

// Email service to send request updates
const sendUpdateRequestEmail = async (userEmail, userName) => {
    try {
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
            text: `Dear ${userName},\n\nWe request you to update your alumni details in our system. Please respond at your earliest convenience.\n\nThank you!`,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendUpdateRequestEmail,
};
