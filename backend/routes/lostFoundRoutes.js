const express = require("express");
const router = express.Router();
const lostFoundController = require("../controllers/lostFoundController");
const auth = require("../middleware/auth");

// Report a lost/found item
router.post("/", auth, lostFoundController.reportItem);
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

module.exports = router;
