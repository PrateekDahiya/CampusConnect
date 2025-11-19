const Complaint = require("../models/Complaint");

// Create a new complaint
exports.createComplaint = async (req, res) => {
    const { title, description, hostel } = req.body;
    try {
        const complaint = new Complaint({
            title,
            description,
            hostel,
            createdBy: req.user.userId, // assuming userId is set in req.user by auth middleware
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get complaints for a specific hostel
exports.getComplaintsByHostel = async (req, res) => {
    const { hostel } = req.params;
    try {
        const complaints = await Complaint.find({ hostel });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update complaint status (creator, staff, or admin)
exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        // Allow update if user is creator, staff, or admin
        const isCreator = complaint.createdBy.toString() === req.user.userId;
        const isStaffOrAdmin =
            req.user.role === "staff" || req.user.role === "admin";
        if (!isCreator && !isStaffOrAdmin) {
            return res.status(403).json({
                message: "Not authorized to update status",
                debug: {
                    createdBy: complaint.createdBy.toString(),
                    userId: req.user.userId,
                    role: req.user.role,
                },
            });
        }
        complaint.status = status;
        complaint.updatedAt = new Date();
        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Add remark to complaint (staff or admin only)
exports.addRemark = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        // Only staff or admin can add remarks
        if (req.user.role !== "staff" && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not authorized to add remarks" });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.remarks.push({
            text,
            addedBy: req.user.userId,
            addedAt: new Date(),
        });
        complaint.updatedAt = new Date();
        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Assign staff to complaint (admin only)
exports.assignStaff = async (req, res) => {
    const { id } = req.params;
    const { staffId } = req.body;
    try {
        // Only admin can assign staff
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not authorized to assign staff" });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.assignedStaff = staffId;
        complaint.updatedAt = new Date();
        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a complaint (owner or admin)
exports.deleteComplaint = async (req, res) => {
    const { id } = req.params;
    try {
        const complaint = await Complaint.findById(id);
        if (!complaint)
            return res.status(404).json({ message: "Complaint not found" });
        const isOwner =
            complaint.createdBy &&
            complaint.createdBy.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin)
            return res
                .status(403)
                .json({ message: "Not authorized to delete complaint" });
        await Complaint.findByIdAndDelete(id);
        res.json({ message: "Complaint deleted" });
    } catch (err) {
        console.error("deleteComplaint error", err);
        res.status(500).json({ message: "Server error" });
    }
};
