const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/auth');


router.post('/', auth, complaintController.createComplaint);

router.get('/all', auth, complaintController.getAllComplaints);
router.get('/hostel/:hostel', auth, complaintController.getComplaintsByHostel);
router.put('/:id/status', auth, complaintController.updateComplaintStatus);

module.exports = router;
