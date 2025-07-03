const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  letter: { type: String, required: true },
  categories: { type: String },
  correctAnswer: { type: String, required: true },
  incorrectAnswers: [{ type: String }],
  image: { type: String }, 
  audio: { type: String }  
});

module.exports = mongoose.model('Question', QuestionSchema);