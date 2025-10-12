const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  images: [{ type: String }], // URLs or file paths
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);
