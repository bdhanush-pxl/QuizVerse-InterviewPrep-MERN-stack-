const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
  title: {
    type: String,
    required: true

  },
  description: {
    type: String,
    default: ''
  },
  questions: [{
    text: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctOption: {
      type: String,
      required: true
    }
  }]
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 