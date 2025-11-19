const Cycle = require('../models/Cycle');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create a new cycle listing
exports.createCycle = async (req, res) => {
  const { name, model, hourlyRate, dailyRate, hostel } = req.body;
  try {
    const images = [];

    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
        fs.unlinkSync(file.path); // Clean up temporary file
      }
    }

    const cycle = new Cycle({
      name,
      model,
      hourlyRate,
      dailyRate,
      hostel,
      images,
      owner: req.user.userId,
      available: true
    });
    await cycle.save();
    res.status(201).json(cycle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all cycles posted by the owner
exports.getMyCycles = async (req, res) => {
    try {
        const cycles = await Cycle.find({ owner: req.user.userId });
        res.json(cycles);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Edit cycle details
exports.editCycle = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const cycle = await Cycle.findOneAndUpdate(
            { _id: id, owner: req.user.userId },
            updates,
            { new: true }
        );
        if (!cycle) {
            return res
                .status(404)
                .json({ message: "Cycle not found or not authorized" });
        }
        res.json(cycle);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Mark cycle as available/unavailable
exports.setAvailability = async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    try {
        const cycle = await Cycle.findOneAndUpdate(
            { _id: id, owner: req.user.userId },
            { available },
            { new: true }
        );
        if (!cycle) {
            return res
                .status(404)
                .json({ message: "Cycle not found or not authorized" });
        }
        res.json(cycle);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get all available cycles (with optional hostel filter)
exports.getAvailableCycles = async (req, res) => {
    const { hostel } = req.query;
    try {
        const query = { available: true };
        if (hostel) query.hostel = hostel;
        const cycles = await Cycle.find(query);
        res.json(cycles);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a cycle (owner or admin)
exports.deleteCycle = async (req, res) => {
    const { id } = req.params;
    try {
        const cycle = await Cycle.findById(id);
        if (!cycle) return res.status(404).json({ message: "Cycle not found" });
        const isOwner =
            cycle.owner && cycle.owner.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin)
            return res
                .status(403)
                .json({ message: "Not authorized to delete cycle" });
        await Cycle.findByIdAndDelete(id);
        res.json({ message: "Cycle deleted" });
    } catch (err) {
        console.error("deleteCycle error", err);
        res.status(500).json({ message: "Server error" });
    }
};
