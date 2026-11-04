export const SOIL_OPTIONS = [
  {
    key: "Red Soil",
    labelKey: "redSoil",
    defaultLabel: "Red Soil",
    averages: { nitrogen: 40, phosphorus: 20, potassium: 40, ph: 6.5 },
  },
  {
    key: "Black Soil",
    labelKey: "blackSoil",
    defaultLabel: "Black Soil",
    averages: { nitrogen: 50, phosphorus: 30, potassium: 60, ph: 7.5 },
  },
  {
    key: "Alluvial Soil",
    labelKey: "alluvialSoil",
    defaultLabel: "Alluvial Soil",
    averages: { nitrogen: 60, phosphorus: 40, potassium: 50, ph: 7.0 },
  },
];

export const getSoilAverages = (soilKey) => {
  const match = SOIL_OPTIONS.find((s) => s.key === soilKey);
  return match ? match.averages : null;
};

// Generates 6-month historical/projected trend data for a given crop price
export const getPriceTrends = (currentPrice) => {
  const multipliers = [0.88, 0.94, 0.98, 1.05, 1.02, 1.0];
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  return months.map((month, i) => ({
    name: month,
    price: Math.round(currentPrice * multipliers[i]),
  }));
};
