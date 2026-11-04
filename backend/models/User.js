const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    history: [{
        location: String,
        recommendedCrops: Array,
        date: { type: Date, default: Date.now }
    }],
    ledger: [{
        date: { type: Date, default: Date.now },
        category: String,
        amount: Number,
        description: String
    }]
});

module.exports = mongoose.model("User", userSchema);