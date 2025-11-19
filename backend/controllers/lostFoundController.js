const LostFound = require("../models/LostFound");

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
            reportedBy: req.user.userId,
        });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
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
        const items = await LostFound.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const isValidObjectId = (id) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// Mark item as resolved (only reporter)
exports.resolveItem = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    try {
        const item = await LostFound.findById(id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        if (item.reportedBy.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        item.status = "resolved";
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Mark item as found (reporter or admin)
exports.markFound = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    try {
        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        // allow reporter or staff/admin
        if (
            item.reportedBy.toString() !== req.user.userId.toString() &&
            req.user.role !== "staff" &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Not authorized" });
        }
        item.found = true;
        item.status = "resolved";
        await item.save();
        res.json(item);
    } catch (err) {
        console.error("markFound error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Simple match-finding endpoint: returns potential matches of opposite type
exports.findMatches = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    try {
        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        const candidates = await LostFound.find({
            found: !item.found,
            _id: { $ne: item._id },
        }).limit(50);
        // naive text match
        const q = (item.title || "") + " " + (item.description || "");
        const qLower = q.toLowerCase();
        const scored = candidates.map((c) => {
            const text = (
                (c.title || "") +
                " " +
                (c.description || "")
            ).toLowerCase();
            const score = qLower
                .split(/\s+/)
                .reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
            return { c, score };
        });
        const top = scored
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((s) => s.c);
        res.json(top);
    } catch (err) {
        console.error("findMatches error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Claim an item
exports.claimItem = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    const { proof } = req.body;
    try {
        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        item.claim = {
            id: new Date().getTime().toString(36),
            userId: req.user.userId,
            proof,
            status: "pending",
            createdAt: new Date(),
        };
        await item.save();
        res.status(201).json(item.claim);
    } catch (err) {
        console.error("claimItem error", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve or reject a claim (staff/admin)
exports.approveClaim = async (req, res) => {
    const { id, claimId } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    const { approve } = req.body;
    try {
        if (req.user.role !== "staff" && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });
        const item = await LostFound.findById(id);
        if (!item || !item.claim || item.claim.id !== claimId)
            return res.status(404).json({ message: "Claim not found" });
        item.claim.status = approve ? "approved" : "rejected";
        item.claim.approvedBy = req.user.userId;
        if (approve) {
            item.found = true;
            item.status = "resolved";
        }
        await item.save();
        res.json(item.claim);
    } catch (err) {
        console.error("approveClaim error", err);
        res.status(500).json({ message: "Server error" });
    }
};
