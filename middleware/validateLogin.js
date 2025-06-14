// Example of validateLogin middleware
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    // Simple validation example
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    next();
};
