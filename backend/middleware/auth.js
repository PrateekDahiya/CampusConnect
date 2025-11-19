const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }
    // Debug output
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    // console.log("Token received:", token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        // Normalize userId to a string to make comparisons consistent across controllers
        req.user = { userId: String(user._id), role: user.role };
        next();
    } catch (err) {
        console.log("JWT verification error:", err);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = auth;
