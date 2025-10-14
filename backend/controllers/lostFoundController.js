const LostFound = require('../models/LostFound');

// Report a lost/found item
exports.reportItem = async (req, res) => {
  const { type, title, description, location, images } = req.body;
  try {
    const item = new LostFound({
      type,
      title,
      description,
      location,
      images,
      reportedBy: req.user.userId
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all lost/found items (with optional filters)
exports.getItems = async (req, res) => {
  const { type, location, status } = req.query;
  try {
    const query = {};
    if (type) query.type = type;
    if (location) query.location = location;
    if (status) query.status = status;
    const items = await LostFound.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark item as resolved (only reporter)
exports.resolveItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await LostFound.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.reportedBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    item.status = 'resolved';
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
