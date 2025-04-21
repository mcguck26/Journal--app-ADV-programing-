// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Define routes
router.get('/login', (req, res) => {
    res.render('login'); // Render login view
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
}));

router.get('/signup', (req, res) => {
    res.render('signup'); // Render signup view
});

router.post('/signup', (req, res) => {
    // Handle user registration logic (validation, saving to DB, etc.)
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Export the router
module.exports = router;
