const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers'); // Import the controller

// Login routes
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.login);

// Signup routes
router.get('/signup', authController.renderSignupPage);
router.post('/signup', authController.signup);

// Logout route
router.get('/logout', authController.logout);

// Dashboard route (protected)
router.get('/dashboard', authController.dashboard);

// Home page: View all journal entries
router.get('/home', authController.renderHomePage);

// View a single journal entry by ID
router.get('/journal/:id', authController.viewJournalEntry);

module.exports = router;


//Routes folder was completed by Skylar 