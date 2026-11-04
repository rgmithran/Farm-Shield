const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existingUser = await User.findOne({ email });
        
        if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Automatically assign admin rights to admin@farm.com for demo/evaluation
        const role = email.toLowerCase() === "admin@farm.com" ? "admin" : "user";

        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        
        // Auto-provision demo accounts if they don't exist yet for quick review
        if (!user && (email === "admin@farm.com" || email === "farmer@farm.com")) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password || "farmshield123", salt);
            const role = email === "admin@farm.com" ? "admin" : "user";
            user = new User({ email, password: hashedPassword, role });
            await user.save();
        }

        if (!user) return res.status(400).json({ message: "Invalid credentials. Please register or check email." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Extended token lifespan (30 days) so demo users don't face sudden token expiration
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "farmshield_secure_key_2026",
            { expiresIn: "30d" }
        );

        res.json({
            token,
            email: user.email,
            role: user.role,
            message: "Logged in successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.history.reverse()); 
    } catch (error) {
        res.status(500).json({ message: "Server error loading history" });
    }
});

// Admin-Only Route: Fetch all searches across the platform
router.get("/admin/overview", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const allUsers = await User.find({ "history.0": { $exists: true } }, "email history");
        
        let allSearches = [];
        allUsers.forEach(u => {
            u.history.forEach(h => {
                allSearches.push({ 
                    email: u.email, 
                    location: h.location, 
                    date: h.date, 
                    crops: (h.recommendedCrops || []).map(c => c.cropName).join(", ") 
                });
            });
        });
        
        allSearches.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allSearches);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching overview" });
    }
});

// Farm Financial Ledger Routes
router.get("/ledger", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const ledger = (user.ledger || []).slice().reverse();
        res.json(ledger);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching ledger entries" });
    }
});

router.post("/ledger", authMiddleware, async (req, res) => {
    try {
        const { category, amount, description } = req.body;
        if (!amount || isNaN(Number(amount))) {
            return res.status(400).json({ message: "Valid amount is required" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newEntry = {
            category: category || "catOther",
            amount: Number(amount),
            description: description || "",
            date: new Date()
        };

        user.ledger.push(newEntry);
        await user.save();

        const updatedLedger = user.ledger.slice().reverse();
        res.json(updatedLedger);
    } catch (error) {
        res.status(500).json({ message: "Server error adding ledger entry" });
    }
});

router.delete("/ledger/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.ledger = user.ledger.filter(item => item._id && item._id.toString() !== req.params.id);
        await user.save();

        const updatedLedger = user.ledger.slice().reverse();
        res.json(updatedLedger);
    } catch (error) {
        res.status(500).json({ message: "Server error deleting expense" });
    }
});

module.exports = router;
