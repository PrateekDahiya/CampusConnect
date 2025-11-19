const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const auth = require("../middleware/auth");

// Add a new book
router.post("/", auth, bookController.addBook);
// Edit book details
router.put("/:id", auth, bookController.editBook);
router.delete("/:id", auth, bookController.deleteBook);
// Browse/search books
router.get("/", auth, bookController.getBooks);
// Request/borrow a book
router.post("/:id/request", auth, bookController.requestBook);
// Return a book
router.put("/:id/return", auth, bookController.returnBook);
// View user's borrowed books
router.get("/my", auth, bookController.getMyBorrowedBooks);

module.exports = router;
