const express = require("express");
const router = express.Router();
const cycleController = require('../controllers/cycleController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

// Create a new cycle listing
router.post('/', auth, upload.array('images', 5), cycleController.createCycle);
const cycleController = require("../controllers/cycleController");
const auth = require("../middleware/auth");

// Create a new cycle listing
router.post("/", auth, cycleController.createCycle);
// Get all cycles posted by the owner
router.get("/my", auth, cycleController.getMyCycles);
// Edit cycle details
router.put("/:id", auth, cycleController.editCycle);
// Delete a cycle
router.delete("/:id", auth, cycleController.deleteCycle);
// Mark cycle as available/unavailable
router.put("/:id/availability", auth, cycleController.setAvailability);
// Get all available cycles (with optional hostel filter)
router.get("/available", auth, cycleController.getAvailableCycles);

module.exports = router;
