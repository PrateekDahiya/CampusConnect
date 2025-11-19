require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const cycleRoutes = require("./routes/cycleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const bookRoutes = require("./routes/bookRoutes");

const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/cycles", cycleRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/lostfound", lostFoundRoutes);

app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handler (logs stack traces for debugging)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error (see server logs)" });
});
