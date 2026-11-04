const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    idealNitrogen: { type: Number, required: true },
    idealPhosphorus: { type: Number, required: true },
    idealPotassium: { type: Number, required: true },
    idealPh: { type: Number, required: true },
    idealTemp: { type: Number, required: true },
    idealHumidity: { type: Number, required: true },
    idealRainfall: { type: Number, required: true },
    marketPricePerKg: { type: Number, required: true },
    cultivationCostPerAcre: { type: Number, required: true }
});

module.exports = mongoose.model("Crop", cropSchema);