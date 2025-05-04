const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Journal = require('../models/Journal');
const authControllers = require('../controllers/authControllers');
const router = express.Router();

// Set up storage engine for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set up GridFS
const conn = mongoose.createConnection('mongodb://localhost:27017/yourDatabase'); // Adjust DB URI
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads'); // Collection name for storing files
});

// Middleware to check if the user is logged in (you can customize this as needed)
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    next();
};

// Create a new journal entry (POST) with file upload
router.post('/create', isAuthenticated, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).send('Title and content are required!');
    }

    let imageFileId = null;
    if (req.file) {
        // Save the file to GridFS
        const writeStream = gfs.createWriteStream({
            filename: req.file.originalname,
            content_type: req.file.mimetype
        });
        writeStream.write(req.file.buffer);
        writeStream.end();
        
        writeStream.on('close', (file) => {
            imageFileId = file._id; // Store file ID in the journal entry
        });
    }

    const newJournal = new Journal({
        userId: req.session.userId, // Associate with logged-in user
        title,
        content,
        imageFileId // Store the image's file ID in the journal entry
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
        
        let image = null;
        if (journal.imageFileId) {
            image = await gfs.files.findOne({ _id: journal.imageFileId });
        }

        res.render('viewJournal', { journal, image }); // Render a page to view the journal
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
router.post('/edit/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required!');
    }

    let imageFileId = null;
    if (req.file) {
        // Save the new image to GridFS and update the file ID
        const writeStream = gfs.createWriteStream({
            filename: req.file.originalname,
            content_type: req.file.mimetype
        });
        writeStream.write(req.file.buffer);
        writeStream.end();

        writeStream.on('close', (file) => {
            imageFileId = file._id; // Store file ID in the journal entry
        });
    }

    try {
        const updatedJournal = await Journal.findByIdAndUpdate(req.params.id, { title, content, imageFileId }, { new: true });
        if (!updatedJournal || updatedJournal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }
        res.redirect('/dashboard'); // Redirect to dashboard after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating journal entry');
    }
});

// Delete a journal entry (POST) and remove the associated image from GridFS
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal || journal.userId.toString() !== req.session.userId.toString()) {
            return res.status(404).send('Journal not found or not authorized');
        }

        if (journal.imageFileId) {
            // Delete the associated image from GridFS
            await gfs.remove({ _id: journal.imageFileId, root: 'uploads' });
        }

        await journal.deleteOne(); // Delete the journal entry
        res.redirect('/dashboard'); // Redirect to dashboard after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting journal entry');
    }
});

// Route to render the dashboard with journal entries
router.get('/dashboard', isAuthenticated, authControllers.dashboard);  // Use the dashboard controller here

module.exports = router;

