const mongoose = require('mongoose');

// Define the schema
const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous'
  },
  postedBy: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

