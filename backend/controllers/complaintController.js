const Complaint = require('../models/Complaint');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create a new complaint
exports.createComplaint = async (req, res) => {
  const { title, description, hostel } = req.body;
  try {
    const images = [];

    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
        fs.unlinkSync(file.path); // Clean up temporary file
      }
    }

    const complaint = new Complaint({
      title,
      description,
      hostel,
      images,
      createdBy: req.user.userId // assuming userId is set in req.user by auth middleware
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get complaints for a specific hostel
exports.getComplaintsByHostel = async (req, res) => {
  const { hostel } = req.params;
  try {
    const complaints = await Complaint.find({ hostel });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update complaint status (creator, staff, or admin)
exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    // Allow update if user is creator, staff, or admin
    const isCreator = complaint.createdBy.toString() === req.user.userId;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';
    if (!isCreator && !isStaffOrAdmin) {
      return res.status(403).json({
        message: 'Not authorized to update status',
        debug: {
          createdBy: complaint.createdBy.toString(),
          userId: req.user.userId,
          role: req.user.role
        }
      });
    }
    complaint.status = status;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
