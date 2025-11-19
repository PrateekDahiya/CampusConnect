const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

// Report a lost/found item
router.post('/', auth, upload.array('images', 5), lostFoundController.reportItem);
// Get all lost/found items (with optional filters)
router.get('/', auth, lostFoundController.getItems);
// Mark item as resolved
router.put('/:id/resolve', auth, lostFoundController.resolveItem);

module.exports = router;
