// models/Journal.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User model
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create Journal model from schema
const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
