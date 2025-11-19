const Book = require('../models/Book');
const BookBorrow = require('../models/BookBorrow');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Add a new book
exports.addBook = async (req, res) => {
  const { title, author, isbn, hostel, description } = req.body;
  try {
    let image = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
      fs.unlinkSync(req.file.path); // Clean up temporary file
    }

    const book = new Book({
      title,
      author,
      isbn,
      hostel,
      image,
      description,
      owner: req.user.userId,
      available: true
    });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit book details (only owner)
exports.editBook = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const book = await Book.findOneAndUpdate({ _id: id, owner: req.user.userId }, updates, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Book not found or not authorized' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Browse/search books
exports.getBooks = async (req, res) => {
  const { title, author, hostel, available } = req.query;
  try {
    const query = {};
    if (title) query.title = new RegExp(title, 'i');
    if (author) query.author = new RegExp(author, 'i');
    if (hostel) query.hostel = hostel;
    if (available !== undefined) query.available = available === 'true';
    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Request/borrow a book
exports.requestBook = async (req, res) => {
  const { id } = req.params;
  const { dueDate } = req.body;
  try {
    const book = await Book.findById(id);
    if (!book || !book.available) {
      return res.status(400).json({ message: 'Book not available' });
    }
    if (book.owner.toString() === req.user.userId.toString()) {
      return res
        .status(400)
        .json({ message: "Owner cannot borrow their own book" });
    }
    const borrow = new BookBorrow({
      book: id,
      borrower: req.user.userId,
      dueDate,
      status: 'borrowed'
    });
    await borrow.save();
    book.available = false;
    book.currentBorrow = borrow._id;
    await book.save();
    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id).populate('currentBorrow');
    if (!book || !book.currentBorrow) {
      return res.status(400).json({ message: 'Book not currently borrowed' });
    }
    if (book.currentBorrow.borrower.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    book.currentBorrow.status = 'returned';
    book.currentBorrow.returnDate = new Date();
    await book.currentBorrow.save();
    book.available = true;
    book.currentBorrow = null;
    await book.save();
    res.json({ message: 'Book returned' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// View user's borrowed books
exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const borrows = await BookBorrow.find({ borrower: req.user.userId }).populate('book');
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
