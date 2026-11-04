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

            // --- ACCURATE AGRONOMIC CROP LIFECYCLE CALENDARS ---
            let cropCalendar = [];
            let cropDuration = "Seasonal (90-120 Days)";
            let cropType = "Seasonal Field Crop";

            switch (crop.cropName) {
                case "Coconut":
                    cropDuration = "5-8 Years Gestation (60+ Years Productive Lifespan)";
                    cropType = "Perennial Plantation Tree Crop";
                    cropCalendar = [
                        { day: "Year 1", task: "Pit Prep & Seedling Planting", desc: "Dig 1m³ pits with compost and topsoil. Plant 9-12 month old disease-free seedlings (TxD/Tall). Provide shaded shelter and basal basin irrigation." },
                        { day: "Years 2-3", task: "Vegetative Establishment", desc: "Apply annual split doses of NPK (500g N, 320g P, 1200g K per palm). Clear 1.8m weed basins and apply green manure crops (sunnhemp)." },
                        { day: "Years 4-5", task: "Crown & Trunk Formation", desc: "Ensure 45-50 liters/day drip irrigation per palm. Place pheromone traps to prevent Rhinoceros Beetle and Red Palm Weevil damage." },
                        { day: "Years 6-7", task: "Initial Spathe & Inflorescence Emergence", desc: "First flower spathe emergence. Apply TNAU Coconut Tonic (200ml/palm) to root zone to arrest button shedding and boost female flowers." },
                        { day: "Year 8+", task: "Full Commercial Bearing & Continuous Harvesting", desc: "Reaches full commercial bearing yielding 80-120 nuts/palm/year. Systematic bunch harvesting every 30-45 days throughout its 60-year lifespan." }
                    ];
                    break;

                case "Mango":
                    cropDuration = "4-5 Years Gestation (Seasonal Summer Harvest)";
                    cropType = "Perennial Fruit Orchard";
                    cropCalendar = [
                        { day: "Year 1", task: "Pit Digging & Graft Planting", desc: "Dig 1m³ pits with FYM and neem cake. Plant grafted varieties (Alphonso, Banganapalli) keeping graft union 15cm above soil level." },
                        { day: "Years 2-3", task: "Formative Pruning & De-Blossoming", desc: "Prune canopy to develop 4-5 scaffold branches. Systematically pinch off early flowers to direct tree energy into vegetative vigor." },
                        { day: "Years 4-5", task: "First Commercial Bearing", desc: "Tree reaches bearing age. Apply Paclobutrazol in September to induce uniform floral buds. Protect panicles from hoppers." },
                        { day: "Annual Cycle (Oct-Dec)", task: "Pre-Flowering & Water Stress", desc: "Withhold irrigation 2 months prior to flowering to promote floral bud differentiation. Resume light watering upon flower opening." },
                        { day: "Annual Cycle (March-June)", task: "Fruit Development & Harvest", desc: "Protect fruits from fruit fly with pheromone traps. Harvest mature firm green fruits with 1cm pedicel at 85% maturity." }
                    ];
                    break;

                case "Sugarcane":
                    cropDuration = "10-12 Months Crop Cycle";
                    cropType = "Annual Cash Crop";
                    cropCalendar = [
                        { day: "Days 1-30", task: "Sett Prep & Deep Planting", desc: "Treat two-budded setts with carbendazim fungicide and plant in deep furrows with basal phosphate and organic manure." },
                        { day: "Days 30-60", task: "Formative Stage & Tillering", desc: "First weeding and hoeing. Maintain light furrow irrigation and apply first top-dress nitrogen to encourage tillering." },
                        { day: "Days 90-120", task: "Grand Growth & Earthing Up", desc: "Perform earthing up to support cane weight and prevent lodging during monsoon winds. Apply remaining potash." },
                        { day: "Days 180-270", task: "Detrashing & Canopy Aeration", desc: "Strip dry bottom leaves (detrashing) to improve air circulation, prevent scale insects, and suppress weed growth." },
                        { day: "Months 10-12", task: "Maturity Testing & Cane Harvesting", desc: "Test Brix index (>18%). Cut canes close to ground level with sharp cutters for maximum sucrose extraction." }
                    ];
                    break;

                case "Banana":
                    cropDuration = "11-13 Months Crop Cycle";
                    cropType = "Annual Tuberous Crop";
                    cropCalendar = [
                        { day: "Month 1", task: "Planting Tissue Culture Plantlets", desc: "Plant hardened tissue culture plantlets in 60cm pits with FYM, neem cake, and Trichoderma. Ensure immediate watering." },
                        { day: "Months 2-4", task: "Active Vegetative Growth", desc: "Weekly fertigation of urea and potash. Systematically desucker (remove suckers) leaving only the mother plant." },
                        { day: "Months 5-7", task: "Pseudostem Growth & Earthing Up", desc: "Earth up soil around pseudostem base and ensure 20-25 liters/plant/day drip irrigation. Monitor for Sigatoka leaf spots." },
                        { day: "Months 8-9", task: "Shooting & Inflorescence Emergence", desc: "Inflorescence emergence (shooting). Denavel (remove male flower bud) and spray micronutrient banana special formulation." },
                        { day: "Months 11-13", task: "Bunch Maturation & Harvesting", desc: "Prop pseudostem with bamboo or casuarina poles. Harvest bunches when fruit ribs turn rounded (75-85% maturity)." }
                    ];
                    break;

                case "Turmeric":
                    cropDuration = "8-9 Months Crop Cycle (240-270 Days)";
                    cropType = "Rhizome Cash Crop";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Rhizome Treatment & Bed Planting", desc: "Treat disease-free mother rhizomes with mancozeb and plant on raised beds at 30x15 cm spacing." },
                        { day: "Days 30-60", task: "First Mulching & Emergence", desc: "Apply green leaf mulch (12.5 t/ha) to conserve moisture and suppress early weeds. Monitor sprout emergence." },
                        { day: "Days 90-120", task: "Second Mulching & Earthing Up", desc: "Apply second split of nitrogen and potash. Earth up soil around beds to facilitate rhizome expansion." },
                        { day: "Days 150-210", task: "Rhizome Bulking Stage", desc: "Maintain regulated soil moisture without waterlogging. Spray micronutrients for rhizome development." },
                        { day: "Days 240-270", task: "Senescence & Harvesting", desc: "Harvest when aerial leaves turn dry and yellow. Carefully dig out rhizome clusters without bruising the fingers." }
                    ];
                    break;

                case "Tapioca (Cassava)":
                    cropDuration = "9-10 Months Crop Cycle (270-300 Days)";
                    cropType = "Tuber Root Crop";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Sett Preparation & Planting", desc: "Prepare 15cm stem cuttings (setts) from mature healthy plants. Plant vertically on mounds or ridges at 90x90 cm." },
                        { day: "Days 30-45", task: "Sprouting & Thinning", desc: "Retain 2 vigorous shoots per sett and nip off excess buds. Carry out first shallow hand weeding." },
                        { day: "Days 60-90", task: "Earthing Up & Potash Top-Dress", desc: "Top dress with potash (MOP) to accelerate tuber root initiation. Earth up soil around the plant base." },
                        { day: "Days 120-210", task: "Tuber Bulking & Pest Check", desc: "Maintain regulated soil moisture. Check for cassava mosaic disease and control whitefly populations." },
                        { day: "Months 9-10", task: "Tuber Maturity & Harvest", desc: "Harvest mature tubers when lower leaves senesce and soil cracks near base. Pull tubers carefully to prevent breakage." }
                    ];
                    break;

                case "Cotton":
                    cropDuration = "5-6 Months Crop Cycle (150-180 Days)";
                    cropType = "Commercial Fiber Crop";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Seed Treatment & Sowing", desc: "Sow acid-delinted hybrid seeds at 90x60 cm with basal fertilizer. Ensure moisture for uniform germination." },
                        { day: "Days 30-45", task: "Squaring & Sucking Pest Control", desc: "Weed field and monitor for aphids, thrips, and jassids. Apply first top-dress nitrogen." },
                        { day: "Days 60-75", task: "Peak Flowering Stage", desc: "Apply Planofix hormone to prevent square and flower drop. Inspect bolls for bollworm infestation." },
                        { day: "Days 90-120", task: "Boll Development & Potassium Spray", desc: "Apply 2% potassium nitrate (13:0:45) foliar spray to boost boll weight and lint quality." },
                        { day: "Days 140-180", task: "Boll Bursting & Multiple Pickings", desc: "Pick clean, dry, fluffy open bolls in 3-4 pickings during morning hours. Store in dry moisture-free conditions." }
                    ];
                    break;

                case "Rice":
                    cropDuration = "115-130 Days Crop Cycle";
                    cropType = "Cereal Food Grain";
                    cropCalendar = [
                        { day: "Days 1-20", task: "Nursery Bed & Land Puddling", desc: "Sow pre-germinated seeds in raised nursery. Thoroughly puddle main field and level soil." },
                        { day: "Days 21-35", task: "Transplanting & Stand Establishment", desc: "Transplant 2-3 seedlings/hill at 20x15 cm spacing. Maintain 2cm shallow standing water." },
                        { day: "Days 40-55", task: "Active Tillering & Cono-Weeding", desc: "Run cono-weeder to aerate root zone. Apply first split dose of nitrogen." },
                        { day: "Days 65-80", task: "Panicle Initiation & Booting", desc: "Apply remaining potash fertilizer. Maintain 5cm water level during panicle development." },
                        { day: "Days 105-125", task: "Grain Filling & Harvesting", desc: "Drain field water 10 days before harvest. Harvest when 80% panicles turn golden yellow." }
                    ];
                    break;

                case "Wheat":
                    cropDuration = "110-125 Days Crop Cycle";
                    cropType = "Rabi Cereal Grain";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Land Prep & Seed Drill Sowing", desc: "Plough field to fine tilth. Sow treated seeds using seed drill at 20cm row spacing with basal NPK." },
                        { day: "Days 20-25", task: "Crown Root Initiation (CRI)", desc: "Most critical irrigation stage. Apply first irrigation followed by top-dress urea." },
                        { day: "Days 40-45", task: "Tillering Stage & Weeding", desc: "Apply second irrigation and remove broadleaf weeds to encourage productive tillers." },
                        { day: "Days 65-75", task: "Flowering & Heading Stage", desc: "Ensure soil moisture during heading and monitor for rust pustules." },
                        { day: "Days 110-125", task: "Grain Hardening & Harvesting", desc: "Harvest when grains are hard and moisture drops below 14%." }
                    ];
                    break;

                case "Maize":
                    cropDuration = "95-105 Days Crop Cycle";
                    cropType = "Coarse Cereal Grain";
                    cropCalendar = [
                        { day: "Days 1-10", task: "Ridge Sowing & Germination", desc: "Plant seeds on ridge sides at 60x20 cm spacing. Ensure light irrigation for germination." },
                        { day: "Days 20-30", task: "Knee-High Stage & FAW Check", desc: "Weed field and apply top-dress nitrogen. Inspect whorls for Fall Armyworm (FAW)." },
                        { day: "Days 45-55", task: "Tasseling & Silking Stage", desc: "Critical moisture stage. Ensure irrigation to facilitate complete pollination." },
                        { day: "Days 65-75", task: "Grain Filling (Milking Stage)", desc: "Maintain soil moisture to maximize kernel weight." },
                        { day: "Days 95-105", task: "Cob Harvesting & De-Husking", desc: "Harvest when husk leaves turn straw yellow and black layer forms at kernel base." }
                    ];
                    break;

                case "Ragi (Finger Millet)":
                    cropDuration = "95-110 Days Crop Cycle";
                    cropType = "Nutri-Cereal Millet";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Nursery Raising / Direct Sowing", desc: "Sow seeds in nursery or direct drill with fine sand mix." },
                        { day: "Days 20-30", task: "Transplanting & Tillering", desc: "Transplant 20-day seedlings at 25x10 cm spacing. Light irrigation." },
                        { day: "Days 45-55", task: "Stem Elongation & Weeding", desc: "Hoe and weed field. Apply split dose of urea." },
                        { day: "Days 65-75", task: "Earhead Emergence (Flowering)", desc: "Ensure adequate moisture during finger development." },
                        { day: "Days 95-110", task: "Earhead Harvesting & Drying", desc: "Harvest when earheads turn brown. Dry on threshing floor." }
                    ];
                    break;

                case "Groundnut":
                    cropDuration = "105-115 Days Crop Cycle";
                    cropType = "Oilseed Legume";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Seed Treatment & Sowing", desc: "Treat kernels with Trichoderma and Rhizobium. Sow at 30x10 cm spacing." },
                        { day: "Days 25-35", task: "Vegetative & Flowering", desc: "Weed thoroughly. Avoid deep inter-cultivation after flowering starts." },
                        { day: "Days 40-50", task: "Pegging Stage (Critical)", desc: "Apply Gypsum (400 kg/ha) at pegging stage to ensure pod calcium filling. Do not disturb soil." },
                        { day: "Days 65-85", task: "Pod Development Stage", desc: "Maintain light sprinkler or furrow irrigation. Monitor for tikka leaf spot." },
                        { day: "Days 105-115", task: "Pod Maturity & Harvest", desc: "Harvest when inner shell turns dark blackish. Pull plants and strip pods." }
                    ];
                    break;

                case "Black Gram (Urad)":
                    cropDuration = "65-75 Days Short Duration Pulse";
                    cropType = "Legume Pulse";
                    cropCalendar = [
                        { day: "Days 1-10", task: "Rhizobium Treatment & Sowing", desc: "Treat seeds with Rhizobium culture. Sow at 30x10 cm spacing in well-drained soil." },
                        { day: "Days 20-25", task: "First Weeding & Root Nodulation", desc: "Hand weed or spray post-emergence herbicide. Nodules fix atmospheric nitrogen." },
                        { day: "Days 35-45", task: "Flowering Stage & Pulse Wonder", desc: "Spray 2% DAP or TNAU pulse wonder to prevent flower drop." },
                        { day: "Days 50-60", task: "Pod Development & Borer Check", desc: "Monitor for pod borers and yellow mosaic virus (whitefly vector)." },
                        { day: "Days 65-75", task: "Pod Maturity & Harvesting", desc: "Harvest when 80% pods turn black. Uproot or cut plants and sun-dry." }
                    ];
                    break;

                case "Tomato":
                    cropDuration = "85-100 Days Crop Cycle";
                    cropType = "Horticultural Vegetable";
                    cropCalendar = [
                        { day: "Days 1-25", task: "Nursery Raising & Hardening", desc: "Raise seedlings under insect-proof net. Harden seedlings 5 days before transplanting." },
                        { day: "Days 25-40", task: "Transplanting & Staking", desc: "Transplant in paired rows at 60x45 cm. Erect stakes to support plants off wet ground." },
                        { day: "Days 45-60", task: "Flowering & Fruit Set", desc: "Fertigate with 19:19:19 water-soluble fertilizer. Spray micronutrients." },
                        { day: "Days 65-80", task: "Fruit Development & Pest Check", desc: "Mulch beds to reduce fruit rot. Inspect for fruit borer and leaf curl." },
                        { day: "Days 80-100", task: "Multiple Pickings & Market", desc: "Pick fruits at breaker stage for distant markets or red ripe for local sale. Harvest every 3-4 days." }
                    ];
                    break;

                case "Onion":
                    cropDuration = "90-110 Days Crop Cycle";
                    cropType = "Bulb Vegetable";
                    cropCalendar = [
                        { day: "Days 1-25", task: "Nursery Bed Raising", desc: "Sow seeds on raised beds. Water with rose can daily." },
                        { day: "Days 30-45", task: "Transplanting into Flat Beds", desc: "Transplant 40-day old seedlings at 15x10 cm in small basins." },
                        { day: "Days 50-65", task: "Vegetative Stage & Light Hoeing", desc: "Shallow hand weeding. Top dress with nitrogen and sulfur." },
                        { day: "Days 70-85", task: "Bulb Enlargement Stage", desc: "Ensure consistent moisture without waterlogging. Apply potash for bulb firmness." },
                        { day: "Days 90-110", task: "Neck Fall & Bulb Curing", desc: "Stop irrigation 10 days before harvest when 50% tops fall. Field cure bulbs in shade for 10 days." }
                    ];
                    break;

                default:
                    cropDuration = "90-120 Days";
                    cropType = "Field Crop";
                    cropCalendar = [
                        { day: "Days 1-15", task: "Land Prep & Sowing", desc: "Plough field to fine tilth, apply basal fertilizer and sow seeds." },
                        { day: "Days 30-45", task: "Tillering & Weeding", desc: "Remove weeds and apply first top-dress fertilizer." },
                        { day: "Days 60-75", task: "Nutrient & Irrigation Management", desc: "Maintain strict moisture levels during vegetative expansion." },
                        { day: "Days 90-100", task: "Pest & Disease Scouting", desc: "Monitor for pests during seed/pod formation." },
                        { day: "Days 120-140", task: "Harvesting & Market Prep", desc: "Harvest fully matured crop and process for market." }
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
                duration: cropDuration,
                cropType: cropType,
                calendar: cropCalendar
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

// --- MERN DATABASE SHOWCASE: FULL CROP CATALOG & CRUD ---
// GET all crops from MongoDB
router.get("/", async (req, res) => {
    try {
        const { search, sortBy } = req.query;
        let query = {};
        if (search) {
            query.cropName = { $regex: search, $options: "i" };
        }
        let sortOption = { cropName: 1 };
        if (sortBy === "price_desc") sortOption = { marketPricePerKg: -1 };
        if (sortBy === "cost_asc") sortOption = { cultivationCostPerAcre: 1 };
        if (sortBy === "cost_desc") sortOption = { cultivationCostPerAcre: -1 };

        const crops = await Crop.find(query).sort(sortOption);
        res.json({
            count: crops.length,
            crops
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch crops database" });
    }
});

// GET single crop details
router.get("/:id", async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) return res.status(404).json({ message: "Crop not found in database" });
        res.json(crop);
    } catch (error) {
        res.status(500).json({ message: "Error fetching crop details" });
    }
});

// POST create new crop (Admin)
router.post("/", async (req, res) => {
    try {
        const {
            cropName, idealNitrogen, idealPhosphorus, idealPotassium,
            idealPh, idealTemp, idealHumidity, idealRainfall,
            marketPricePerKg, cultivationCostPerAcre
        } = req.body;

        if (!cropName) return res.status(400).json({ message: "Crop name is required" });

        const existing = await Crop.findOne({ cropName: new RegExp(`^${cropName}$`, "i") });
        if (existing) return res.status(400).json({ message: "A crop with this name already exists in database" });

        const newCrop = new Crop({
            cropName,
            idealNitrogen: Number(idealNitrogen) || 50,
            idealPhosphorus: Number(idealPhosphorus) || 30,
            idealPotassium: Number(idealPotassium) || 40,
            idealPh: Number(idealPh) || 6.5,
            idealTemp: Number(idealTemp) || 26,
            idealHumidity: Number(idealHumidity) || 65,
            idealRainfall: Number(idealRainfall) || 120,
            marketPricePerKg: Number(marketPricePerKg) || 30,
            cultivationCostPerAcre: Number(cultivationCostPerAcre) || 15000
        });

        await newCrop.save();
        res.status(201).json({ message: "Crop successfully added to MongoDB", crop: newCrop });
    } catch (error) {
        res.status(500).json({ message: "Failed to save new crop to database" });
    }
});

// PUT update crop (Admin)
router.put("/:id", async (req, res) => {
    try {
        const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Crop not found" });
        res.json({ message: "Crop updated in MongoDB", crop: updated });
    } catch (error) {
        res.status(500).json({ message: "Failed to update crop" });
    }
});

// DELETE crop (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Crop.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Crop not found" });
        res.json({ message: "Crop deleted from MongoDB" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete crop" });
    }
});

module.exports = router;
