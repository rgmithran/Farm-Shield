const express = require("express");
const router = express.Router();

const DISTRICT_PRESETS = [
    "Coimbatore", "Chennai", "Madurai", "Thanjavur", "Tiruchirappalli",
    "Salem", "Erode", "Tirunelveli", "Dindigul", "Nilgiris",
    "Cuddalore", "Vellore", "Theni", "Dharmapuri", "Kanchipuram",
    "Thoothukudi", "Villupuram", "Nagapattinam", "Namakkal", "Karur",
    "Pudukkottai", "Ramanathapuram", "Sivaganga", "Tiruvannamalai", "Virudhunagar"
];

// Helper to compute smart agricultural advisories based on meteorological metrics
const computeAgriAdvisories = (temp, humidity, windKmh, rainPop, condition) => {
    let sprayAdvisory = {
        status: "Good",
        badge: "Optimal for Spraying",
        color: "#137333",
        bg: "#e6f4ea",
        desc: "Favorable wind speed and low rain probability allow maximum chemical/bio-agent absorption."
    };

    if (windKmh > 18) {
        sprayAdvisory = {
            status: "Hazardous",
            badge: "High Drift Risk",
            color: "#c5221f",
            bg: "#fce8e6",
            desc: `Wind speed is ${windKmh} km/h. High pesticide spray drift will cause off-target contamination.`
        };
    } else if (rainPop > 45 || condition.toLowerCase().includes("rain")) {
        sprayAdvisory = {
            status: "Poor",
            badge: "Washout Risk",
            color: "#b06000",
            bg: "#fef7e0",
            desc: "Imminent rainfall will wash away foliar sprays. Postpone chemical/nutrient applications."
        };
    }

    let irrigationAdvisory = {
        badge: "Irrigation Recommended",
        color: "#1a73e8",
        bg: "#e8f0fe",
        desc: "Dry conditions with low rain probability. Run scheduled drip or furrow irrigation."
    };

    if (rainPop > 50 || condition.toLowerCase().includes("rain")) {
        irrigationAdvisory = {
            badge: "Postpone Irrigation",
            color: "#137333",
            bg: "#e6f4ea",
            desc: "Natural precipitation expected. Delay irrigation to conserve water and prevent waterlogging."
        };
    } else if (temp > 35) {
        irrigationAdvisory = {
            badge: "High Evapotranspiration Alert",
            color: "#b06000",
            bg: "#fef7e0",
            desc: "High heat index. Irrigate early in the morning or late evening to prevent thermal stress."
        };
    }

    let diseaseRisk = {
        level: "Low",
        badge: "Low Pathogen Pressure",
        color: "#137333",
        desc: "Relative humidity is within safe operational baseline."
    };

    if (humidity > 78 && temp >= 22 && temp <= 32) {
        diseaseRisk = {
            level: "High",
            badge: "High Fungal Risk Alert",
            color: "#c5221f",
            desc: "Warm temperature and humidity > 78% create prime conditions for blight, blast, and powdery mildew."
        };
    }

    return { sprayAdvisory, irrigationAdvisory, diseaseRisk };
};

router.get("/forecast", async (req, res) => {
    try {
        const location = req.query.location || "Coimbatore";
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey || apiKey === "paste_your_api_key_here") {
            const fallbackDays = ["Thu", "Fri", "Sat", "Sun", "Mon"];
            const mockDaily = fallbackDays.map((day, i) => {
                const temp = 28 + (i % 3);
                const humidity = 65 + (i * 4);
                const wind = 12 + (i * 2);
                const rainPop = (i % 2 === 0) ? 20 : 60;
                const desc = (i % 2 === 0) ? "Partly Cloudy" : "Scattered Showers";
                const advisories = computeAgriAdvisories(temp, humidity, wind, rainPop, desc);
                return {
                    date: day,
                    temp,
                    feelsLike: temp + 2,
                    humidity,
                    windSpeed: wind,
                    rainProb: rainPop,
                    desc,
                    icon: (i % 2 === 0) ? "⛅" : "🌧️",
                    ...advisories
                };
            });
            return res.json({
                location,
                forecast: mockDaily,
                currentAdvisories: mockDaily[0]
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)},IN&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== "200") {
            // If location with ',IN' failed, try direct query
            const fallbackUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
            const fbResponse = await fetch(fallbackUrl);
            const fbData = await fbResponse.json();
            if (fbData.cod !== "200") {
                return res.status(400).json({ message: `Location "${location}" not found. Please choose from the district list.` });
            }
            return formatForecastResponse(fbData, location, res);
        }

        return formatForecastResponse(data, location, res);

    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ message: "Failed to fetch weather forecast." });
    }
});

function formatForecastResponse(data, location, res) {
    const dailyItems = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    const itemsToUse = dailyItems.length >= 4 ? dailyItems : data.list.filter((_, idx) => idx % 8 === 0);

    const dailyData = itemsToUse.slice(0, 5).map(item => {
        const date = new Date(item.dt * 1000);
        const temp = Math.round(item.main.temp);
        const feelsLike = Math.round(item.main.feels_like);
        const humidity = item.main.humidity;
        const windKmh = Math.round((item.wind?.speed || 0) * 3.6);
        const rainPop = Math.round((item.pop || 0) * 100);
        const desc = item.weather[0].description;
        const advisories = computeAgriAdvisories(temp, humidity, windKmh, rainPop, desc);

        return {
            date: date.toLocaleDateString("en-US", { weekday: 'short' }),
            fullDate: date.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }),
            temp,
            feelsLike,
            humidity,
            windSpeed: windKmh,
            rainProb: rainPop,
            desc,
            icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
            ...advisories
        };
    });

    res.json({
        location: data.city?.name || location,
        country: data.city?.country || "IN",
        forecast: dailyData,
        currentAdvisories: dailyData[0] || {}
    });
}

router.get("/districts", (req, res) => {
    res.json(DISTRICT_PRESETS);
});

module.exports = router;
