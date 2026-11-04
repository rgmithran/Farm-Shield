const express = require("express");
const router = express.Router();

router.get("/forecast", async (req, res) => {
    try {
        const { location } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;
        
        // Fallback for testing if no real OpenWeather API key is set
        if (!apiKey || apiKey === "paste_your_api_key_here") {
            return res.json([
                { date: "Mon", temp: 28, desc: "Clear Sky", icon: "☀️" },
                { date: "Tue", temp: 29, desc: "Partly Cloudy", icon: "⛅" },
                { date: "Wed", temp: 27, desc: "Moderate Rain", icon: "🌧️" },
                { date: "Thu", temp: 26, desc: "Thunderstorm", icon: "⛈️" },
                { date: "Fri", temp: 28, desc: "Sunny", icon: "☀️" }
            ]);
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== "200") return res.status(400).json({ message: "Location not found" });

        // Filter to get roughly one forecast per day (at 12:00 PM)
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => {
            const date = new Date(item.dt * 1000);
            return {
                date: date.toLocaleDateString("en-US", { weekday: 'short' }),
                temp: Math.round(item.main.temp),
                desc: item.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
            };
        });

        res.json(dailyData.slice(0, 5));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch weather forecast." });
    }
});

module.exports = router;