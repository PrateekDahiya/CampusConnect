const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

// Book a cycle
router.post("/book/:cycleId", auth, bookingController.bookCycle);
// Return a cycle
router.put("/return/:bookingId", auth, bookingController.returnCycle);
// Extend a booking
router.put("/extend/:bookingId", auth, bookingController.extendBooking);
// View user's bookings
router.get("/my", auth, bookingController.getMyBookings);
// Get pending requests for cycle owner
router.get("/pending", auth, bookingController.getPendingRequests);

// Approve a booking
router.put("/:bookingId/approve", auth, bookingController.approveBooking);
// Reject a booking
router.put("/:bookingId/reject", auth, bookingController.rejectBooking);
// Cancel a booking request (by borrower)
router.put("/:bookingId/cancel", auth, bookingController.cancelBooking);

module.exports = router;
