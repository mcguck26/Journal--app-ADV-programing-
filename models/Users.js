const mongoose = require('mongoose');

// Create a schema for the user
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    interests: {
        type: [String],  // Array of strings
        default: []
    }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;

