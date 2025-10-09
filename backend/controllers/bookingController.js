const Booking = require('../models/Booking');
const Cycle = require('../models/Cycle');

// Book a cycle
exports.bookCycle = async (req, res) => {
  const { cycleId } = req.params;
  const { startTime, endTime } = req.body;
  try {
    const cycle = await Cycle.findById(cycleId);
    if (!cycle || !cycle.available) {
      return res.status(400).json({ message: 'Cycle not available' });
    }
    if (cycle.owner.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Owner cannot book their own cycle' });
    }
    const booking = new Booking({
      cycle: cycleId,
      borrower: req.user.userId,
      startTime,
      endTime,
      status: 'pending',
      approval: false
    });
    await booking.save();
    cycle.available = false;
    cycle.currentBooking = booking._id;
    await cycle.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Return a cycle
exports.returnCycle = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId).populate('cycle');
    if (!booking || booking.borrower.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized or booking not found' });
    }
    booking.status = 'returned';
    await booking.save();
    const cycle = await Cycle.findById(booking.cycle._id);
    cycle.available = true;
    cycle.currentBooking = null;
    await cycle.save();
    res.json({ message: 'Cycle returned', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Extend a booking
exports.extendBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { newEndTime } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.borrower.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized or booking not found' });
    }
    booking.endTime = newEndTime;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// View user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ borrower: req.user.userId }).populate('cycle');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
