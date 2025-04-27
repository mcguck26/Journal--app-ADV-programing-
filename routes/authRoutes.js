const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers'); // Import the controller

// Login routes
router.get('/login', authController.renderLoginPage);  // Use controller to render the login page
router.post('/login', authController.login);           // Use controller for login logic

// Signup routes
router.get('/signup', authController.renderSignupPage);  // Use controller to render the signup page
router.post('/signup', authController.signup);           // Use controller for signup logic

// Logout route
router.get('/logout', authController.logout);            // Use controller for logout logic

// Dashboard route (protected)
router.get('/dashboard', authController.dashboard);      // Use controller to render dashboard page

module.exports = router;

