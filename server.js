// Import the correct libraries
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');  // Import the authRoutes file
const journalRoutes = require('./routes/journalRoutes');  // Import the journalRoutes file

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');  // Tells Express to use EJS for rendering views
app.set('views', path.join(__dirname, 'views')); // Specify the views folder

// Authentication setup
app.use(session({ 
  secret: process.env.SESSION_SECRET,  // Use SESSION_SECRET from .env
  resave: false, 
  saveUninitialized: true,
}));

require('./config/passport');  // Import the passport config
app.use(passport.initialize());
app.use(passport.session());

// MongoDB setup using environment variable from .env
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});

// Sample route to check if server is working
app.get('/', (req, res) => {
    res.send('Welcome to the Journal App!');
});

// Use the authentication routes (login, signup, logout)
app.use(authRoutes);  // Now the server knows about the routes in authRoutes.js

// Use the journal routes for journal functionality
app.use('/journal', journalRoutes);  // All journal-related routes are now prefixed with '/journal'

// Use PORT from .env or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
