const express = require("express");
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

// Report a lost/found item
router.post('/', auth, upload.array('images', 5), lostFoundController.reportItem);
// Get all lost/found items (with optional filters)
router.get("/", auth, lostFoundController.getItems);
// Mark item as resolved
router.put("/:id/resolve", auth, lostFoundController.resolveItem);
// Mark item as found
router.put("/:id/found", auth, lostFoundController.markFound);
// Find potential matches for an item
router.get("/:id/matches", auth, lostFoundController.findMatches);
// Claim an item
router.post("/:id/claim", auth, lostFoundController.claimItem);
// Approve/reject a claim
router.put("/:id/claim/:claimId", auth, lostFoundController.approveClaim);
// Delete a lost/found item
router.delete("/:id", auth, lostFoundController.deleteItem);

module.exports = router;
