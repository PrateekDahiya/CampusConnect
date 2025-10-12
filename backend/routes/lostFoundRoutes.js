const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');

// Report a lost/found item
router.post('/', auth, lostFoundController.reportItem);
// Get all lost/found items (with optional filters)
router.get('/', auth, lostFoundController.getItems);
// Mark item as resolved
router.put('/:id/resolve', auth, lostFoundController.resolveItem);

module.exports = router;
