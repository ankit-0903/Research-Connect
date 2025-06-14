const Admin = require('../models/adminModels');
const bcrypt = require('bcryptjs');

// Controller to handle GET requests for /login (e.g., render login page)
exports.getLogin = (req, res) => {
    res.render('login', { title: 'AlumConnect | Sign In' }); // Ensure 'login' matches your view/template name
};

// Controller to handle POST requests for /login (authentication)
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find admin by email in the database
        const admin = await Admin.findOne({ email });

        // If no admin is found
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            // Store user information in the session
            req.session.adminId = admin._id;
            req.session.email = admin.email;

            // Log the session to verify data
            console.log('Session before saving:', req.session);

            // Save the session and handle errors
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ error: 'Failed to save session' });
                }
                    // Log the session to verify data
            // console.log('Session After saving:', req.session);

                // Redirect to the dashboard or another protected route
                return res.redirect('/dashboard');
            });
        } else {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login process:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
