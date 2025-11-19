const express = require("express");
const router = express.Router();

const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');
const complaintController = require("../controllers/complaintController");
const auth = require("../middleware/auth");

router.post("/", auth, complaintController.createComplaint);

router.post('/', auth, upload.array('images', 5), complaintController.createComplaint);

router.get('/all', auth, complaintController.getAllComplaints);
router.get('/hostel/:hostel', auth, complaintController.getComplaintsByHostel);
router.put('/:id/status', auth, complaintController.updateComplaintStatus);
router.get("/all", auth, complaintController.getAllComplaints);
router.get("/hostel/:hostel", auth, complaintController.getComplaintsByHostel);
router.put("/:id/status", auth, complaintController.updateComplaintStatus);
router.post("/:id/remarks", auth, complaintController.addRemark);
router.put("/:id/assign", auth, complaintController.assignStaff);
router.delete("/:id", auth, complaintController.deleteComplaint);

module.exports = router;
