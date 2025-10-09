require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');


const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require("./routes/complaintRoutes");



const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();


// Routes
app.use('/api/auth', authRoutes);

app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
