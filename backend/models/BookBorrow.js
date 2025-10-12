const mongoose = require('mongoose');

const bookBorrowSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['requested', 'borrowed', 'returned', 'overdue'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('BookBorrow', bookBorrowSchema);
