const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String },
  hourlyRate: { type: Number },
  dailyRate: { type: Number },
  hostel: { type: String, required: true },
  images: [{ type: String }], // URLs or file paths
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

module.exports = mongoose.model('Cycle', cycleSchema);
