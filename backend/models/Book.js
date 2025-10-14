const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  hostel: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  currentBorrow: { type: mongoose.Schema.Types.ObjectId, ref: 'BookBorrow' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
