// routes/journalRoutes.js
const express = require('express');
const Journal = require('../models/Journal');
const authControllers = require('../controllers/authControllers');
const router = express.Router();

// Middleware to check if the user is logged in (you can customize this as needed)
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    next();
};

// Create a new journal entry (POST)
router.post('/create', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).send('Title and content are required!');
    }

    const newJournal = new Journal({
        userId: req.session.userId, // Associate with logged-in user
        title,
        content
    });

    try {
        await newJournal.save();
        res.redirect('/dashboard'); // Redirect to dashboard after saving
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating journal entry');
    }
});

// Get all journal entries for the logged-in user (GET)
router.get('/all', isAuthenticated, async (req, res) => {
    try {
        const journals = await Journal.find({ userId: req.session.userId });
        res.render('dashboard', { journals }); // Pass entries to the dashboard view
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving journal entries');
    }
});

// Get a specific journal entry (GET)
router.get('/view/:id', isAuthenticated, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal || journal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }
        res.render('viewJournal', { journal }); // Render a page to view the journal
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving journal entry');
    }
});

// Edit a journal entry (GET)
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal || journal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }
        res.render('editJournal', { journal }); // Render an edit page
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving journal entry for editing');
    }
});

// Update a journal entry (POST)
router.post('/edit/:id', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).send('Title and content are required!');
    }

    try {
        const updatedJournal = await Journal.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
        if (!updatedJournal || updatedJournal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }
        res.redirect('/dashboard'); // Redirect to dashboard after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating journal entry');
    }
});

// Delete a journal entry (POST)
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal || journal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }

        await journal.remove(); // Delete the journal entry
        res.redirect('/dashboard'); // Redirect to dashboard after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting journal entry');
    }
});

// Route to render the dashboard with journal entries
router.get('/dashboard', isAuthenticated, authControllers.dashboard);  // Use the dashboard controller here

module.exports = router;
