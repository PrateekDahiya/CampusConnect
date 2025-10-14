const Cycle = require('../models/Cycle');

// Create a new cycle listing
exports.createCycle = async (req, res) => {
  const { name, model, hourlyRate, dailyRate, hostel, images } = req.body;
  try {
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit cycle details
exports.editCycle = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const cycle = await Cycle.findOneAndUpdate({ _id: id, owner: req.user.userId }, updates, { new: true });
    if (!cycle) {
      return res.status(404).json({ message: 'Cycle not found or not authorized' });
    }
    res.json(cycle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark cycle as available/unavailable
exports.setAvailability = async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  try {
    const cycle = await Cycle.findOneAndUpdate({ _id: id, owner: req.user.userId }, { available }, { new: true });
    if (!cycle) {
      return res.status(404).json({ message: 'Cycle not found or not authorized' });
    }
    res.json(cycle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
};
