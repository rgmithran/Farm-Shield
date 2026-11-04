const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Automatically assign admin rights to this specific email for testing
        const role = email === "admin@farm.com" ? "admin" : "user";

        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1h" });

        // Send the role back to the frontend
        res.json({ token, email: user.email, role: user.role, message: "Logged in successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.history.reverse()); 
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Admin-Only Route: Fetch all searches across the platform
router.get("/admin/overview", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== "admin") return res.status(403).json({ message: "Access denied. Admin only." });

        // Grab all users who have at least one search in their history
        const allUsers = await User.find({ "history.0": { $exists: true } }, "email history");
        
        let allSearches = [];
        allUsers.forEach(u => {
            u.history.forEach(h => {
                allSearches.push({ 
                    email: u.email, 
                    location: h.location, 
                    date: h.date, 
                    crops: h.recommendedCrops.map(c => c.cropName).join(", ") 
                });
            });
        });
        
        // Sort newest global searches first
        allSearches.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allSearches);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching overview" });
    }
});

module.exports = router;