const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Book a cycle
router.post('/book/:cycleId', auth, bookingController.bookCycle);
// Return a cycle
router.put('/return/:bookingId', auth, bookingController.returnCycle);
// Extend a booking
router.put('/extend/:bookingId', auth, bookingController.extendBooking);
// View user's bookings
router.get('/my', auth, bookingController.getMyBookings);

module.exports = router;
