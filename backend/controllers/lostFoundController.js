const LostFound = require('../models/LostFound');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Report a lost/found item
exports.reportItem = async (req, res) => {
  const { type, title, description, location } = req.body;
  try {
    const images = [];

    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
        fs.unlinkSync(file.path); // Clean up temporary file
      }
    }

    const item = new LostFound({
      type,
      title,
      description,
      location,
      images,
      reportedBy: req.user.userId
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all lost/found items (with optional filters)
exports.getItems = async (req, res) => {
    const { type, location, status, q, category, sort } = req.query;
    try {
        const query = {};
        if (type) query.type = type;
        if (location) query.location = location;
        if (category) query.category = category;
        if (status) {
            // support 'open' alias meaning not resolved
            if (status === "open") query.status = { $ne: "resolved" };
            else query.status = status;
        }
        if (q) {
            // case-insensitive partial match against title or description
            const regex = new RegExp(
                q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );
            query.$or = [{ title: regex }, { description: regex }];
        }

        const sortOrder =
            sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
        const items = await LostFound.find(query).sort(sortOrder);
        res.json(items);
    } catch (err) {
        console.error("getItems error", err);
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
        // Fetch candidates (exclude resolved items and self). We fetch a larger
        // candidate set and score in-app so we can combine multiple signals.
        const candidates = await LostFound.find({
            found: !item.found,
            _id: { $ne: item._id },
            status: { $ne: "resolved" },
        })
            .limit(500)
            .lean();

        // Build tokens from title+description: simple normalization and stopword removal
        const stopwords = new Set([
            "the",
            "and",
            "a",
            "an",
            "of",
            "in",
            "on",
            "at",
            "for",
            "to",
            "is",
            "are",
        ]);
        const raw = (
            (item.title || "") +
            " " +
            (item.description || "")
        ).toLowerCase();
        const tokens = Array.from(
            new Set(
                raw
                    .replace(/[^a-z0-9\s]/g, " ")
                    .split(/\s+/)
                    .filter((w) => w && w.length >= 3 && !stopwords.has(w))
            )
        );

        const now = Date.now();
        const scored = candidates.map((c) => {
            const title = (c.title || "").toLowerCase();
            const desc = (c.description || "").toLowerCase();
            // text score: prefer title matches
            let textScore = 0;
            for (const t of tokens) {
                if (title.includes(t)) textScore += 3;
                else if (desc.includes(t)) textScore += 1;
            }

            // location boost
            let locationBoost = 0;
            try {
                if (
                    item.location &&
                    c.location &&
                    item.location.toLowerCase() === c.location.toLowerCase()
                )
                    locationBoost = 4;
            } catch (e) {}

            // category boost
            const categoryBoost =
                item.category && c.category && item.category === c.category
                    ? 2
                    : 0;

            // recency boost (items within 30 days get higher score)
            let recencyBoost = 0;
            if (c.createdAt) {
                const days = Math.max(
                    0,
                    (now - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24)
                );
                if (days <= 1) recencyBoost = 3;
                else if (days <= 7) recencyBoost = 2;
                else if (days <= 30) recencyBoost = 1;
            }

            const total =
                textScore + locationBoost + categoryBoost + recencyBoost;
            return { item: c, score: total };
        });

        // Keep only positive-scoring candidates and sort
        const positive = scored.filter((s) => s.score > 0);
        if (positive.length === 0) return res.json([]);
        positive.sort((a, b) => b.score - a.score);

        const max = positive[0].score || 1;
        // normalize score to 0-100
        const results = positive
            .slice(0, 50)
            .map((s) => ({
                ...s.item,
                score: Math.round((s.score / max) * 100),
            }));
        res.json(results);
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

// Delete a lost/found item (reporter or admin)
exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id))
        return res.status(400).json({ message: "Invalid id" });
    try {
        const item = await LostFound.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        const isReporter =
            item.reportedBy && item.reportedBy.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";
        if (!isReporter && !isAdmin)
            return res
                .status(403)
                .json({ message: "Not authorized to delete item" });
        await LostFound.findByIdAndDelete(id);
        res.json({ message: "Item deleted" });
    } catch (err) {
        console.error("deleteItem error", err);
        res.status(500).json({ message: "Server error" });
    }
};
