const Booking = require("../models/Booking");
const Cycle = require("../models/Cycle");

// Create a booking request (pending approval)
exports.bookCycle = async (req, res) => {
    const { cycleId } = req.params;
    const { startTime, endTime } = req.body;
    try {
        const cycle = await Cycle.findById(cycleId);
        if (!cycle || !cycle.available) {
            return res.status(400).json({ message: "Cycle not available" });
        }
        if (cycle.owner.toString() === req.user.userId) {
            return res
                .status(400)
                .json({ message: "Owner cannot book their own cycle" });
        }

        // Check if user already has a pending request for this cycle
        const existingRequest = await Booking.findOne({
            cycle: cycleId,
            borrower: req.user.userId,
            status: "pending",
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending request for this cycle",
            });
        }

        const booking = new Booking({
            cycle: cycleId,
            borrower: req.user.userId,
            startTime,
            endTime,
            status: "pending",
            approval: false,
        });
        await booking.save();

        // Don't mark cycle as unavailable until approved
        res.status(201).json(booking);
    } catch (err) {
        console.error("bookCycle error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Return a cycle
exports.returnCycle = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate("cycle");
        if (!booking || String(booking.borrower) !== String(req.user.userId)) {
            return res
                .status(403)
                .json({ message: "Not authorized or booking not found" });
        }
        booking.status = "returned";
        await booking.save();
        const cycle = await Cycle.findById(booking.cycle._id);
        cycle.available = true;
        cycle.currentBooking = null;
        await cycle.save();
        res.json({ message: "Cycle returned", booking });
    } catch (err) {
        console.error("returnCycle error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Extend a booking
exports.extendBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { newEndTime } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking || String(booking.borrower) !== String(req.user.userId)) {
            return res
                .status(403)
                .json({ message: "Not authorized or booking not found" });
        }
        booking.endTime = newEndTime;
        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error("extendBooking error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// View user's bookings (newest first)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            borrower: req.user.userId,
        })
            .sort({ createdAt: -1 })
            .populate("cycle");
        res.json(bookings);
    } catch (err) {
        console.error("getMyBookings error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve a booking
exports.approveBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate("cycle");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (String(booking.cycle.owner) !== String(req.user.userId)) {
            return res
                .status(403)
                .json({ message: "Only cycle owner can approve" });
        }
        booking.status = "active";
        booking.approval = true;
        await booking.save();
        // Update cycle availability
        const cycle = await Cycle.findById(booking.cycle._id);
        cycle.available = false;
        cycle.currentBooking = booking._id;
        await cycle.save();
        res.json({ message: "Booking approved", booking });
    } catch (err) {
        console.error("approveBooking error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Reject a booking
exports.rejectBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate("cycle");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (String(booking.cycle.owner) !== String(req.user.userId)) {
            return res
                .status(403)
                .json({ message: "Only cycle owner can reject" });
        }
        booking.status = "rejected";
        booking.approval = false;
        await booking.save();
        // Make cycle available again
        const cycle = await Cycle.findById(booking.cycle._id);
        cycle.available = true;
        cycle.currentBooking = null;
        await cycle.save();
        res.json({ message: "Booking rejected", booking });
    } catch (err) {
        console.error("rejectBooking error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Cancel a booking request (by borrower)
exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (String(booking.borrower) !== String(req.user.userId)) {
            return res
                .status(403)
                .json({ message: "Only borrower can cancel their request" });
        }
        if (booking.status !== "pending") {
            return res
                .status(400)
                .json({ message: "Can only cancel pending requests" });
        }

        booking.status = "cancelled";
        await booking.save();
        res.json({ message: "Booking request cancelled", booking });
    } catch (err) {
        console.error("cancelBooking error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get pending booking requests for cycle owner
exports.getPendingRequests = async (req, res) => {
    try {
        const cycles = await Cycle.find({ owner: req.user.userId });
        const cycleIds = cycles.map((c) => c._id);

        const pendingRequests = await Booking.find({
            cycle: { $in: cycleIds },
            status: "pending",
        })
            .sort({ createdAt: -1 })
            .populate("cycle")
            .populate("borrower", "name email");

        res.json(pendingRequests);
    } catch (err) {
        console.error("getPendingRequests error", err);
        res.status(500).json({ message: "Server error" });
    }
};
