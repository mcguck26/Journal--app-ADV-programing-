const bcrypt = require('bcrypt');
const User = require('../models/Users'); // Import User model
const Journal = require('../models/Journal');  // Import Journal model
const Prompt = require('../models/Prompt');  // Import Prompt model

// Render login page
exports.renderLoginPage = (req, res) => {
    res.render('login');
};

// Handle user login
exports.login = async (req, res) => {
    const { username, password } = req.body;  // Changed to use username instead of email

    try {
        // Find user by username (not email)
        const user = await User.findOne({ username });
        if (!user) {
            return res.send('Invalid username or password!');
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send('Invalid username or password!');
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
    const { username, password, interests } = req.body;  // Remove email field, only username

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username already in use!');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // If no interests were selected, default to an empty array
        let userInterests = interests ? (Array.isArray(interests) ? interests : [interests]) : [];

        // Create new user
        const newUser = new User({
            username,
            password: hashedPassword,
            interests: userInterests // Save the user's selected interests
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
        // Find the user by their session userId
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login'); // User not found, redirect to login
        }

        // Fetch the journals for the logged-in user
        const journals = await Journal.find({ userId: req.session.userId });

        // Fetch personalized prompts based on the user's interests
        const userInterests = user.interests;  // Array of interests
        const prompts = await Prompt.find({
            category: { $in: userInterests }  // Match prompts where category is one of the user's interests
        });

        // Render the dashboard view, passing user, journals, and personalized prompts data
        res.render('dashboard', { user, journals, prompts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Home Route: Display all journal entries for the logged-in user
exports.renderHomePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login'); // User not found, redirect to login
        }

        // Fetch all journals for the logged-in user
        const journals = await Journal.find({ userId: req.session.userId });

        // Render the home page with the user's journal entries
        res.render('home', { journals });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Single Journal Entry Route: View a specific journal entry
exports.viewJournalEntry = async (req, res) => {
    const { id } = req.params; // Get the journal entry ID from the URL

    try {
        // Find the specific journal entry by ID
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).send('Journal entry not found');
        }

        // Render the view journal page with the journal data
        res.render('viewJournal', { journal });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Delete journal entries successfully
exports.deleteJournal = async (req, res) => {
    try {
        const journalId = req.params.id;
        await Journal.findByIdAndDelete(journalId);  // Find and delete the journal entry
        res.redirect('/dashboard');  // Redirect back to dashboard after deletion
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting journal entry');
    }
};
