const bcrypt = require('bcrypt');
const User = require('../models/Users'); // Import User model
const Journal = require('../models/Journal');  // Import your Journal model

// Render login page
exports.renderLoginPage = (req, res) => {
    res.render('login');
};

// Handle user login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('Invalid email or password!');
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send('Invalid email or password!');
        }

        // Store user ID in session
        req.session.userId = user._id;

        // Redirect to the dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Render signup page
exports.renderSignupPage = (req, res) => {
    res.render('signup');
};

// Handle user signup
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('Email already in use!');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Redirect to the login page
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Logout and destroy the session
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

// Render dashboard page
exports.dashboard = async (req, res) => {
    try {
        // Find the user
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login'); // User not found, redirect to login
        }

        // Fetch the journals for the logged-in user
        const journals = await Journal.find({ userId: req.session.userId });

        // Render the dashboard view, passing user and journals data
        res.render('dashboard', { user, journals });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};