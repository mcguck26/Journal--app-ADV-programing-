// models/Prompt.js
const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  category: String, // e.g., 'exercise', 'reflection', 'gratitude'
  text: String      // e.g., "How was today's workout?"
});

module.exports = mongoose.model('Prompt', promptSchema);
