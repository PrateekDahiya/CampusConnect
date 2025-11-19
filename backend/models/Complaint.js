const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hostel: { type: String, required: true }, // e.g., 'Hostel A', 'Hostel B'
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  images: [{ type: String }] // Array of image URLs
});

module.exports = mongoose.model('Complaint', complaintSchema);
