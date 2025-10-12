const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'active', 'returned', 'rejected'], default: 'pending' },
  requestTime: { type: Date, default: Date.now },
  approval: { type: Boolean, default: false } // for optional approval feature
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
