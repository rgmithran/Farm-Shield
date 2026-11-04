const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const Crop = require("./models/Crop");

const cropData = [
    // --- GRAINS & MILLETS ---
    { cropName: "Rice", idealNitrogen: 80, idealPhosphorus: 40, idealPotassium: 40, idealPh: 6.0, idealTemp: 25, idealHumidity: 80, idealRainfall: 200, marketPricePerKg: 32, cultivationCostPerAcre: 15000 },
    { cropName: "Wheat", idealNitrogen: 60, idealPhosphorus: 30, idealPotassium: 30, idealPh: 6.5, idealTemp: 20, idealHumidity: 50, idealRainfall: 100, marketPricePerKg: 28, cultivationCostPerAcre: 12000 },
    { cropName: "Maize", idealNitrogen: 100, idealPhosphorus: 40, idealPotassium: 40, idealPh: 6.5, idealTemp: 24, idealHumidity: 65, idealRainfall: 100, marketPricePerKg: 22, cultivationCostPerAcre: 14000 },
    { cropName: "Ragi (Finger Millet)", idealNitrogen: 40, idealPhosphorus: 20, idealPotassium: 20, idealPh: 6.0, idealTemp: 26, idealHumidity: 50, idealRainfall: 80, marketPricePerKg: 35, cultivationCostPerAcre: 10000 },
    { cropName: "Black Gram (Urad)", idealNitrogen: 20, idealPhosphorus: 40, idealPotassium: 20, idealPh: 6.5, idealTemp: 27, idealHumidity: 65, idealRainfall: 70, marketPricePerKg: 85, cultivationCostPerAcre: 12000 },

    // --- CASH CROPS ---
    { cropName: "Cotton", idealNitrogen: 120, idealPhosphorus: 50, idealPotassium: 50, idealPh: 6.5, idealTemp: 28, idealHumidity: 60, idealRainfall: 150, marketPricePerKg: 65, cultivationCostPerAcre: 20000 },
    { cropName: "Sugarcane", idealNitrogen: 150, idealPhosphorus: 60, idealPotassium: 60, idealPh: 7.0, idealTemp: 32, idealHumidity: 70, idealRainfall: 250, marketPricePerKg: 5, cultivationCostPerAcre: 30000 },
    { cropName: "Turmeric", idealNitrogen: 120, idealPhosphorus: 50, idealPotassium: 80, idealPh: 6.0, idealTemp: 28, idealHumidity: 75, idealRainfall: 150, marketPricePerKg: 110, cultivationCostPerAcre: 40000 },
    { cropName: "Coconut", idealNitrogen: 50, idealPhosphorus: 20, idealPotassium: 100, idealPh: 6.0, idealTemp: 27, idealHumidity: 80, idealRainfall: 150, marketPricePerKg: 40, cultivationCostPerAcre: 20000 },
    
    // --- VEGETABLES & TUBERS ---
    { cropName: "Tapioca (Cassava)", idealNitrogen: 60, idealPhosphorus: 40, idealPotassium: 100, idealPh: 6.0, idealTemp: 28, idealHumidity: 65, idealRainfall: 100, marketPricePerKg: 20, cultivationCostPerAcre: 15000 },
    { cropName: "Groundnut", idealNitrogen: 30, idealPhosphorus: 50, idealPotassium: 40, idealPh: 6.5, idealTemp: 27, idealHumidity: 50, idealRainfall: 70, marketPricePerKg: 55, cultivationCostPerAcre: 18000 },
    { cropName: "Tomato", idealNitrogen: 100, idealPhosphorus: 60, idealPotassium: 80, idealPh: 6.2, idealTemp: 22, idealHumidity: 65, idealRainfall: 80, marketPricePerKg: 25, cultivationCostPerAcre: 25000 },
    { cropName: "Onion", idealNitrogen: 100, idealPhosphorus: 50, idealPotassium: 50, idealPh: 6.5, idealTemp: 20, idealHumidity: 60, idealRainfall: 75, marketPricePerKg: 30, cultivationCostPerAcre: 20000 },

    // --- FRUITS ---
    { cropName: "Banana", idealNitrogen: 200, idealPhosphorus: 50, idealPotassium: 300, idealPh: 6.5, idealTemp: 28, idealHumidity: 80, idealRainfall: 200, marketPricePerKg: 18, cultivationCostPerAcre: 35000 },
    { cropName: "Mango", idealNitrogen: 100, idealPhosphorus: 50, idealPotassium: 100, idealPh: 6.0, idealTemp: 30, idealHumidity: 60, idealRainfall: 80, marketPricePerKg: 60, cultivationCostPerAcre: 25000 }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected. Seeding Tamil Nadu crop data...");
        await Crop.deleteMany({}); // Clears old data
        await Crop.insertMany(cropData);
        console.log(`Successfully seeded ${cropData.length} crops into the database!`);
        process.exit();
    })
    .catch(err => {
        console.error("Seeding Error: ", err);
        process.exit(1);
    });