const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hostel: { type: String, required: true }, // e.g., 'Hostel A', 'Hostel B'
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  images: [{ type: String }] // Array of image URLs
    title: { type: String, required: true },
    description: { type: String, required: true },
    hostel: { type: String, required: true }, // e.g., 'Hostel A', 'Hostel B'
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved", "Rejected"],
        default: "Pending",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: [
        {
            text: { type: String, required: true },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            addedAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", complaintSchema);
