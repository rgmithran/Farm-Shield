const express = require("express");
const multer = require("multer");
const router = express.Router();

// Configure Multer to store the uploaded image temporarily in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post("/detect", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image uploaded." });

        const base64Image = req.file.buffer.toString("base64");
        const apiKey = process.env.PLANT_ID_API_KEY; 
        
        // Safe fallback for testing before you register for a real API key
        if (!apiKey || apiKey === "paste_your_api_key_here") {
             return res.json({ 
                 diseaseName: "Early Blight (Simulated Data)", 
                 confidence: "94.2%", 
                 treatment: "Prune infected leaves. Apply a copper-based fungicide to the lower canopy." 
             });
        }

        // Live API call to Plant.id
        const response = await fetch("https://plant.id/api/v3/identification", {
            method: "POST",
            headers: {
                "Api-Key": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                images: [base64Image],
                disease_details: ["description", "treatment"]
            })
        });
        const data = await response.json();

        const diagnosis = data.result.disease.suggestions[0];
        res.json({
            diseaseName: diagnosis.name,
            confidence: (diagnosis.probability * 100).toFixed(1) + "%",
            treatment: diagnosis.details.treatment || "Consult a local agronomist."
        });
    } catch (error) {
        console.error("Disease API Error:", error);
        res.status(500).json({ message: "Failed to process image." });
    }
});

module.exports = router;