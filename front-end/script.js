
const cropForm = document.getElementById("cropForm");

cropForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const farmerData = {
        location: document.getElementById("location").value,
        soilType: document.getElementById("soilType").value,
        nitrogen: Number(document.getElementById("nitrogen").value),
        phosphorus: Number(document.getElementById("phosphorus").value),
        potassium: Number(document.getElementById("potassium").value),
        ph: Number(document.getElementById("ph").value),
        temperature: Number(document.getElementById("temperature").value),
        humidity: Number(document.getElementById("humidity").value),
        rainfall: Number(document.getElementById("rainfall").value),
        land: Number(document.getElementById("land").value)
    };

    if (
        farmerData.nitrogen < 0 ||
        farmerData.ph < 0 ||
        farmerData.ph > 14 ||
        farmerData.humidity < 0 ||
        farmerData.humidity > 100 ||
        farmerData.rainfall < 0 ||
        farmerData.land <= 0
    ) {
        alert("Please enter valid farming details.");
        return;
    }

    const resultBox = document.getElementById("result");

    resultBox.innerHTML = `
        <h3>Analyzing Your Farm...</h3>
        <p>Please wait while we check your soil and climate details.</p>
    `;

    try {
        // This endpoint will be created in our Express backend.
        const response = await fetch(
            "http://localhost:5000/api/crops/recommend",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(farmerData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Recommendation failed");
        }

        resultBox.innerHTML = `
            <div class="result-icon">🌾</div>
            <h3>Recommended Crops</h3>
            <p>Location: ${escapeHTML(farmerData.location)}</p>
            <br>
            <div>
                ${result.recommendations.map(crop => `
                    <div class="crop-result">
                        <h3>${escapeHTML(crop.cropName)}</h3>
                        <p>Suitability: ${crop.suitabilityScore}%</p>
                        <p style="color: #218746; font-weight: 600;">Expected Profit: ₹${crop.expectedProfit}</p>
                    </div>
                `).join("")}
            </div>
        `;

    } catch (error) {
        resultBox.innerHTML = `
            <h3>Unable to get recommendations</h3>
            <p>${escapeHTML(error.message)}</p>
            <p>Make sure the backend server is running.</p>
        `;
    }
});

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}
