const express = require("express");
const router = express.Router();
const Crop = require("../models/Crop");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const fetchLiveMarketPrice = async (cropName) => {
    const basePrices = { 
        "Rice": 32, "Wheat": 28, "Maize": 22, "Ragi (Finger Millet)": 35, "Black Gram (Urad)": 85,
        "Cotton": 65, "Sugarcane": 5, "Turmeric": 110, "Coconut": 40, 
        "Tapioca (Cassava)": 20, "Groundnut": 55, "Tomato": 25, "Onion": 30, 
        "Banana": 18, "Mango": 60
    };
    const fallbackPrice = basePrices[cropName] || 30;

    try {
        const apiKey = process.env.MARKET_API_KEY;
        if (!apiKey || apiKey === "paste_your_api_key_here") return fallbackPrice;

        const commodityMap = {
            "Rice": "Paddy(Dhan)(Common)", "Wheat": "Wheat", "Cotton": "Cotton", 
            "Sugarcane": "Sugarcane", "Maize": "Maize", "Groundnut": "Groundnut", 
            "Tomato": "Tomato", "Onion": "Onion", "Banana": "Banana", 
            "Mango": "Mango", "Turmeric": "Turmeric", "Coconut": "Coconut"
        };
        const mappedName = commodityMap[cropName] || cropName;
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[commodity]=${mappedName}`;

        const fetchPromise = fetch(url).then(res => res.json());
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
        
        const data = await Promise.race([fetchPromise, timeoutPromise]);

        if (data.records && data.records.length > 0) {
            return parseFloat((data.records[0].modal_price / 100).toFixed(2));
        }
        return fallbackPrice;
    } catch (error) {
        return fallbackPrice; 
    }
};

router.post("/recommend", async (req, res) => {
    try {
        const { location, nitrogen, phosphorus, potassium, ph, land } = req.body;
        
        let temp = 28, humidity = 65, rain = 150; 
        try {
            const apiKey = process.env.WEATHER_API_KEY;
            if (apiKey && apiKey !== "paste_your_api_key_here") {
                const weatherPromise = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`).then(r => r.json());
                const weatherTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Weather Timeout")), 1500));
                
                const weatherData = await Promise.race([weatherPromise, weatherTimeout]);
                if (weatherData.cod === 200) {
                    temp = weatherData.main.temp;
                    humidity = weatherData.main.humidity;
                    rain = weatherData.rain && weatherData.rain["1h"] ? weatherData.rain["1h"] * 30 : 150; 
                }
            }
        } catch (err) {
            console.log("Weather API skipped or timed out.");
        }
        
        const crops = await Crop.find();
        
        const recommendations = await Promise.all(crops.map(async (crop) => {
            const nDiff = Math.abs(crop.idealNitrogen - nitrogen) / crop.idealNitrogen;
            const phDiff = Math.abs(crop.idealPh - ph) / crop.idealPh;
            const tempDiff = Math.abs(crop.idealTemp - temp) / crop.idealTemp;
            
            let score = 100 - ((nDiff + phDiff + tempDiff) / 3) * 100;
            score = Math.max(0, Math.min(100, Math.round(score)));

            const nDeficit = Math.max(0, crop.idealNitrogen - nitrogen);
            const pDeficit = Math.max(0, crop.idealPhosphorus - phosphorus);
            const kDeficit = Math.max(0, crop.idealPotassium - potassium);
            
            let fertilizer = "Organic Compost (Nutrients optimal)";
            if (nDeficit > 0 || pDeficit > 0 || kDeficit > 0) {
                if (nDeficit >= pDeficit && nDeficit >= kDeficit) fertilizer = "Urea (Nitrogen-rich)";
                else if (pDeficit >= nDeficit && pDeficit >= kDeficit) fertilizer = "DAP (Phosphorus-rich)";
                else fertilizer = "MOP / Potash (Potassium-rich)";
            }

            let irrigationMethod = "Drip Irrigation (Highly water-efficient)";
            const surfaceCrops = ["Rice", "Wheat"];
            const sprinklerCrops = ["Groundnut", "Onion", "Black Gram (Urad)", "Ragi (Finger Millet)"];
            if (surfaceCrops.includes(crop.cropName)) irrigationMethod = "Surface/Flood Irrigation (Requires heavy water)";
            else if (sprinklerCrops.includes(crop.cropName)) irrigationMethod = "Micro-Sprinkler / Rain Pipe";

            // --- NEW: DYNAMIC CROP CALENDAR ---
            let cropCalendar = [];
            const shortCrops = ["Tomato", "Onion", "Black Gram (Urad)"];
            const longCrops = ["Sugarcane", "Banana", "Turmeric", "Tapioca (Cassava)"];
            const treeCrops = ["Coconut", "Mango"];
            
            if (shortCrops.includes(crop.cropName)) {
                cropCalendar = [
                    { day: "Days 1-7", task: "Sowing & Transplanting", desc: "Prepare beds and sow seeds/seedlings." },
                    { day: "Days 20-30", task: "First Weeding", desc: "Clear weeds to prevent nutrient loss." },
                    { day: "Days 40-50", task: "Flowering Stage", desc: "Apply recommended fertilizer to boost flower formation." },
                    { day: "Days 60-70", task: "Pest Control", desc: "Spray organic pesticides to protect early fruits." },
                    { day: "Days 80-90", task: "Harvesting", desc: "Pick mature crops and prepare for market." }
                ];
            } else if (longCrops.includes(crop.cropName)) {
                cropCalendar = [
                    { day: "Month 1", task: "Deep Ploughing", desc: "Plough deeply and plant rhizomes/setts/saplings." },
                    { day: "Month 3", task: "Earthing Up", desc: "Weed and earth up the soil around the base." },
                    { day: "Month 5-6", task: "Nutrient Management", desc: "Apply main dose of recommended fertilizer." },
                    { day: "Month 8-9", task: "Growth Monitoring", desc: "Maintain strict irrigation schedules." },
                    { day: "Month 10-12", task: "Harvesting", desc: "Harvest fully matured crop." }
                ];
            } else if (treeCrops.includes(crop.cropName)) {
                cropCalendar = [
                    { day: "Month 1-2", task: "Pruning & Prep", desc: "Prune dead branches and prepare water basins." },
                    { day: "Month 4-5", task: "Pre-Monsoon Care", desc: "Apply recommended fertilizer before the rains." },
                    { day: "Month 8-9", task: "Post-Monsoon Care", desc: "Clear basin weeds and monitor for fungal pests." },
                    { day: "Month 10-11", task: "Fruiting Care", desc: "Ensure adequate water during fruit setting." },
                    { day: "Month 12", task: "Harvesting", desc: "Harvest mature yield." }
                ];
            } else {
                // Medium crops: Rice, Wheat, Cotton, Maize, Groundnut, Ragi
                cropCalendar = [
                    { day: "Days 1-15", task: "Land Prep & Sowing", desc: "Plough field and sow seeds." },
                    { day: "Days 30-45", task: "Tillering & Weeding", desc: "Remove weeds and monitor early growth." },
                    { day: "Days 60-75", task: "Nutrient Management", desc: "Apply recommended fertilizer for healthy development." },
                    { day: "Days 90-100", task: "Pest & Disease Check", desc: "Monitor for pests during seed/pod formation." },
                    { day: "Days 120-140", task: "Harvesting", desc: "Harvest and process for the market." }
                ];
            }

            const currentLivePrice = await fetchLiveMarketPrice(crop.cropName);

            return {
                cropName: crop.cropName,
                suitabilityScore: score,
                livePricePerKg: currentLivePrice,
                expectedProfit: Math.round((currentLivePrice * 2000 * land) - (crop.cultivationCostPerAcre * land)),
                appliedWeather: { temp, humidity, rain },
                recommendedFertilizer: fertilizer,
                recommendedIrrigation: irrigationMethod,
                calendar: cropCalendar // Attach calendar to response
            };
        }));

        recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
        const finalRecommendations = recommendations.slice(0, 3);

        const allSchemes = [
            { name: "PM-KISAN Samman Nidhi", desc: "₹6,000 per year minimum income support paid in 3 installments.", eligibility: "All landholding farmers." },
            { name: "TN Micro Irrigation Scheme", desc: "100% subsidy for drip/sprinkler irrigation installation.", eligibility: land <= 5 ? "Eligible (Small/Marginal Farmer)" : "75% Subsidy Eligible (Other Farmers)" },
            { name: "PM Fasal Bima Yojana (Crop Insurance)", desc: "Premium insurance coverage against natural calamities, pests, and diseases.", eligibility: "All farmers growing notified crops." },
            { name: "Uzhavar Pathukappu Thittam (TN)", desc: "Social security, educational assistance, and marriage assistance for farming families.", eligibility: land <= 2.5 ? "Highly Eligible (Under 2.5 Acres)" : "Requires special verification" }
        ];

        const token = req.header("Authorization");
        if (token) {
            try {
                const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
                const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || "fallback_secret");
                await User.findByIdAndUpdate(decoded.id, {
                    $push: { history: { location, recommendedCrops: finalRecommendations, date: new Date() } }
                });
            } catch (err) {}
        }

        res.json({ recommendations: finalRecommendations, schemes: allSchemes.slice(0, 3) });
    } catch (error) {
        console.error("CRITICAL SERVER ERROR:", error);
        res.status(500).json({ message: "Server error during recommendation" });
    }
});

module.exports = router;