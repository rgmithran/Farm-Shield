import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './index.css';

const t = {
  en: {
    home: "Workspace", recommend: "Crop Intelligence", dashboard: "My Farm", admin: "Admin Console",
    login: "Sign In", register: "Create Account", logout: "Sign Out",
    tabCrop: "Crop Intelligence", tabDisease: "AI Disease Detection", tabWeather: "5-Day Weather Forecast", tabLedger: "Digital Ledger",
    formTitle: "Agricultural Parameters", formSub: "Enter your land specifications to generate a customized agronomic report.",
    location: "Location (District)", soilType: "Soil Classification", selectSoil: "Select Soil Type",
    redSoil: "Red Soil", blackSoil: "Black Soil", alluvialSoil: "Alluvial Soil",
    nitrogen: "Nitrogen (N)", phosphorus: "Phosphorus (P)", potassium: "Potassium (K)", ph: "Soil pH", landArea: "Area (Acres)",
    analyzing: "Processing Data...", getRecBtn: "Run Analysis",
    resultsTitle: "Agronomic Analysis Report", resultsSub: "Based on current market trends and environmental data.",
    weather: "Environmental Conditions", humidity: "Humidity", match: "Suitability",
    liveRate: "Current Market Rate", profit: "Projected Net Profit", fertilizer: "Nutrient Strategy",
    irrigation: "Irrigation Protocol", trend: "6-Month Market Projection (₹/kg)", downloadPdf: "Export PDF Report",
    diseaseTitle: "AI Plant Pathology", diseaseSub: "Upload a clear photo of an infected leaf for instant diagnosis and treatment plans.",
    scanBtn: "Analyze Image", scanningBtn: "Scanning Leaf...", treatmentTitle: "Recommended Treatment",
    weatherTitle: "Hyper-Local Weather Forecast", weatherSub: "Plan your farming activities with a precise 5-day outlook.",
    fetchWeatherBtn: "Get Forecast", fetchingWeather: "Fetching...",
    historyTitle: "Historical Analyses", noHistory: "No data found. Run a new analysis to build your ledger.",
    adminTitle: "Global Platform Analytics", date: "Timestamp", email: "User Identity", topCrops: "Generated Recommendations",
    welcomeBack: "Sign in to FarmShield", createAccount: "Register for FarmShield", password: "Password",
    schemesTitle: "Eligible Subsidies & Government Schemes",
    ledgerTitle: "Farm Financial Ledger", ledgerSub: "Track your daily agricultural expenses to calculate your true net profit.",
    addExpense: "Log Expense", expenseCat: "Category", amount: "Amount (₹)", desc: "Description", totalExpenses: "Total Operating Cost",
    catSeeds: "Seeds & Saplings", catLabor: "Labor / Wages", catFert: "Fertilizers & Pesticides", catEquip: "Tractor & Equipment", catTrans: "Transport & Logistics", catOther: "Other",
    calendarTitle: "Dynamic Crop Lifecycle Calendar",
    calendarDays: { "Days 1-7": "Days 1-7", "Days 20-30": "Days 20-30", "Days 40-50": "Days 40-50", "Days 60-70": "Days 60-70", "Days 80-90": "Days 80-90", "Days 1-15": "Days 1-15", "Days 30-45": "Days 30-45", "Days 60-75": "Days 60-75", "Days 90-100": "Days 90-100", "Days 120-140": "Days 120-140", "Month 1": "Month 1", "Month 3": "Month 3", "Month 5-6": "Month 5-6", "Month 8-9": "Month 8-9", "Month 10-12": "Month 10-12", "Month 1-2": "Month 1-2", "Month 4-5": "Month 4-5", "Month 10-11": "Month 10-11", "Month 12": "Month 12" },
    calendarTasks: { "Sowing & Transplanting": "Sowing & Transplanting", "First Weeding": "First Weeding", "Flowering Stage": "Flowering Stage", "Pest Control": "Pest Control", "Land Prep & Sowing": "Land Prep & Sowing", "Tillering & Weeding": "Tillering & Weeding", "Nutrient Management": "Nutrient Management", "Pest & Disease Check": "Pest & Disease Check", "Deep Ploughing": "Deep Ploughing", "Earthing Up": "Earthing Up", "Growth Monitoring": "Growth Monitoring", "Pruning & Prep": "Pruning & Prep", "Pre-Monsoon Care": "Pre-Monsoon Care", "Post-Monsoon Care": "Post-Monsoon Care", "Fruiting Care": "Fruiting Care", "Harvesting": "Harvesting" },
    calendarDesc: { "Prepare beds and sow seeds/seedlings.": "Prepare beds and sow seeds/seedlings.", "Clear weeds to prevent nutrient loss.": "Clear weeds to prevent nutrient loss.", "Apply recommended fertilizer to boost flower formation.": "Apply recommended fertilizer to boost flower formation.", "Spray organic pesticides to protect early fruits.": "Spray organic pesticides to protect early fruits.", "Pick mature crops and prepare for market.": "Pick mature crops and prepare for market.", "Plough deeply and plant rhizomes/setts/saplings.": "Plough deeply and plant rhizomes/setts/saplings.", "Weed and earth up the soil around the base.": "Weed and earth up the soil around the base.", "Apply main dose of recommended fertilizer.": "Apply main dose of recommended fertilizer.", "Maintain strict irrigation schedules.": "Maintain strict irrigation schedules.", "Harvest fully matured crop.": "Harvest fully matured crop.", "Prune dead branches and prepare water basins.": "Prune dead branches and prepare water basins.", "Apply recommended fertilizer before the rains.": "Apply recommended fertilizer before the rains.", "Clear basin weeds and monitor for fungal pests.": "Clear basin weeds and monitor for fungal pests.", "Ensure adequate water during fruit setting.": "Ensure adequate water during fruit setting.", "Harvest mature yield.": "Harvest mature yield.", "Plough field and sow seeds.": "Plough field and sow seeds.", "Remove weeds and monitor early growth.": "Remove weeds and monitor early growth.", "Apply recommended fertilizer for healthy development.": "Apply recommended fertilizer for healthy development.", "Monitor for pests during seed/pod formation.": "Monitor for pests during seed/pod formation.", "Harvest and process for the market.": "Harvest and process for the market." },
    crops: { "Rice": "Rice (Paddy)", "Wheat": "Wheat", "Maize": "Maize", "Ragi (Finger Millet)": "Ragi (Finger Millet)", "Black Gram (Urad)": "Black Gram (Urad)", "Cotton": "Cotton", "Sugarcane": "Sugarcane", "Turmeric": "Turmeric", "Coconut": "Coconut", "Tapioca (Cassava)": "Tapioca (Cassava)", "Groundnut": "Groundnut", "Tomato": "Tomato", "Onion": "Onion", "Banana": "Banana", "Mango": "Mango" },
    fertilizers: { "Organic Compost (Nutrients optimal)": "Organic Compost (Optimum Baseline)", "Urea (Nitrogen-rich)": "Urea (Nitrogen Deficit Detected)", "DAP (Phosphorus-rich)": "DAP (Phosphorus Deficit Detected)", "MOP / Potash (Potassium-rich)": "MOP / Potash (Potassium Deficit Detected)" },
    irrigations: { "Drip Irrigation (Highly water-efficient)": "Drip Irrigation (High Efficiency)", "Surface/Flood Irrigation (Requires heavy water)": "Surface Irrigation (Flood Method)", "Micro-Sprinkler / Rain Pipe": "Micro-Sprinkler System" },
    schemes: { "PM-KISAN Samman Nidhi": "PM-KISAN Samman Nidhi", "TN Micro Irrigation Scheme": "TN Micro Irrigation Scheme", "PM Fasal Bima Yojana (Crop Insurance)": "PM Fasal Bima Yojana (Crop Insurance)", "Uzhavar Pathukappu Thittam (TN)": "Uzhavar Pathukappu Thittam (TN)" },
    diseases: { "Early Blight (Simulated Data)": "Early Blight" },
    treatments: { "Prune infected leaves. Apply a copper-based fungicide to the lower canopy.": "Prune infected leaves. Apply a copper-based fungicide to the lower canopy." },
    days: { "Mon": "Mon", "Tue": "Tue", "Wed": "Wed", "Thu": "Thu", "Fri": "Fri", "Sat": "Sat", "Sun": "Sun" }
  },
  ta: {
    home: "பணியிடம்", recommend: "பயிர் பகுப்பாய்வு", dashboard: "என் விவசாயம்", admin: "நிர்வாகி தளம்",
    login: "உள்நுழைக", register: "கணக்கை உருவாக்கு", logout: "வெளியேறு",
    tabCrop: "பயிர் பகுப்பாய்வு", tabDisease: "நோய் கண்டறிதல்", tabWeather: "வானிலை அறிக்கை", tabLedger: "டிஜிட்டல் லெட்ஜர்",
    formTitle: "விவசாய அளவுருக்கள்", formSub: "தனிப்பயனாக்கப்பட்ட வேளாண் அறிக்கையைப் பெற நில விவரங்களை உள்ளிடவும்.",
    location: "மாவட்டம் / இடம்", soilType: "மண் வகைப்பாடு", selectSoil: "மண் வகையை தேர்ந்தெடுக்கவும்",
    redSoil: "செம்மண்", blackSoil: "கரிசல் மண்", alluvialSoil: "வண்டல் மண்",
    nitrogen: "நைட்ரஜன் (N)", phosphorus: "பாஸ்பரஸ் (P)", potassium: "பொட்டாசியம் (K)", ph: "மண் pH", landArea: "பரப்பளவு (ஏக்கர்)",
    analyzing: "தரவு செயலாக்கப்படுகிறது...", getRecBtn: "பகுப்பாய்வு செய்",
    resultsTitle: "வேளாண் பகுப்பாய்வு அறிக்கை", resultsSub: "தற்போதைய சந்தை நிலவரம் மற்றும் சுற்றுச்சூழல் தரவின் அடிப்படையில்.",
    weather: "சுற்றுச்சூழல் நிலை", humidity: "ஈரப்பதம்", match: "பொருத்தம்",
    liveRate: "சந்தை விலை", profit: "மதிப்பிடப்பட்ட நிகர லாபம்", fertilizer: "உர மேலாண்மை",
    irrigation: "நீர்ப்பாசன முறை", trend: "6 மாத சந்தை கணிப்பு (₹/kg)", downloadPdf: "PDF ஆக பதிவிறக்கு",
    diseaseTitle: "செயற்கை நுண்ணறிவு நோய் கண்டறிதல்", diseaseSub: "நோயறிதல் மற்றும் சிகிச்சை திட்டங்களுக்கு இலையின் புகைப்படத்தை பதிவேற்றவும்.",
    scanBtn: "பகுப்பாய்வு செய்", scanningBtn: "ஆராய்கிறது...", treatmentTitle: "பரிந்துரைக்கப்படும் சிகிச்சை",
    weatherTitle: "உள்ளூர் வானிலை அறிக்கை", weatherSub: "5 நாள் துல்லியமான வானிலை அறிக்கையுடன் பணிகளைத் திட்டமிடுங்கள்.",
    fetchWeatherBtn: "அறிக்கை பெறு", fetchingWeather: "பெறப்படுகிறது...",
    historyTitle: "பகுப்பாய்வு வரலாறு", noHistory: "தரவு இல்லை. புதிய பகுப்பாய்வை தொடங்கவும்.",
    adminTitle: "தளத்தின் உலகளாவிய பகுப்பாய்வு", date: "நேரம்", email: "பயனர்", topCrops: "பரிந்துரைகள்",
    welcomeBack: "உள்நுழைக", createAccount: "புதிய கணக்கு", password: "கடவுச்சொல்",
    schemesTitle: "தகுதியான அரசு மானியங்கள் & திட்டங்கள்",
    ledgerTitle: "பண்ணை செலவு கண்காணிப்பாளர்", ledgerSub: "உண்மையான நிகர லாபத்தை கணக்கிட உங்கள் தினசரி செலவுகளை பதிவு செய்யவும்.",
    addExpense: "செலவைச் சேர்", expenseCat: "வகை", amount: "தொகை (₹)", desc: "விவரம்", totalExpenses: "மொத்த செலவுகள்",
    catSeeds: "விதைகள் & நாற்றுகள்", catLabor: "கூலி / உழைப்பு", catFert: "உரம் & பூச்சிக்கொல்லி", catEquip: "டிராக்டர் & உபகரணங்கள்", catTrans: "போக்குவரத்து", catOther: "மற்றவை",
    calendarTitle: "பயிர் வளர்ப்பு காலண்டர்",
    calendarDays: { "Days 1-7": "நாட்கள் 1-7", "Days 20-30": "நாட்கள் 20-30", "Days 40-50": "நாட்கள் 40-50", "Days 60-70": "நாட்கள் 60-70", "Days 80-90": "நாட்கள் 80-90", "Days 1-15": "நாட்கள் 1-15", "Days 30-45": "நாட்கள் 30-45", "Days 60-75": "நாட்கள் 60-75", "Days 90-100": "நாட்கள் 90-100", "Days 120-140": "நாட்கள் 120-140", "Month 1": "மாதம் 1", "Month 3": "மாதம் 3", "Month 5-6": "மாதம் 5-6", "Month 8-9": "மாதம் 8-9", "Month 10-12": "மாதம் 10-12", "Month 1-2": "மாதம் 1-2", "Month 4-5": "மாதம் 4-5", "Month 10-11": "மாதம் 10-11", "Month 12": "மாதம் 12" },
    calendarTasks: { "Sowing & Transplanting": "விதைத்தல் & நடுதல்", "First Weeding": "முதல் களை எடுத்தல்", "Flowering Stage": "பூக்கும் பருவம்", "Pest Control": "பூச்சி கட்டுப்பாடு", "Land Prep & Sowing": "நிலம் தயாரித்தல் & விதைத்தல்", "Tillering & Weeding": "கிளைத்தல் & களை எடுத்தல்", "Nutrient Management": "உர மேலாண்மை", "Pest & Disease Check": "பூச்சி மற்றும் நோய் கண்காணிப்பு", "Deep Ploughing": "ஆழமாக உழுதல்", "Earthing Up": "மண் அணைத்தல்", "Growth Monitoring": "வளர்ச்சி கண்காணிப்பு", "Pruning & Prep": "கத்தரித்தல் & பாத்தி அமைத்தல்", "Pre-Monsoon Care": "பருவமழைக்கு முந்தைய பராமரிப்பு", "Post-Monsoon Care": "பருவமழைக்கு பிந்தைய பராமரிப்பு", "Fruiting Care": "பழம் பிடிக்கும் பருவம்", "Harvesting": "அறுவடை" },
    calendarDesc: { "Prepare beds and sow seeds/seedlings.": "பாத்திகள் அமைத்து விதைகளை அல்லது நாற்றுகளை நடவும்.", "Clear weeds to prevent nutrient loss.": "சத்துக்கள் வீணாவதைத் தடுக்க களைகளை அகற்றவும்.", "Apply recommended fertilizer to boost flower formation.": "பூக்கள் உருவாவதை ஊக்குவிக்க உரத்தை இடவும்.", "Spray organic pesticides to protect early fruits.": "பிஞ்சுகளைப் பாதுகாக்க பூச்சிக்கொல்லிகளை தெளிக்கவும்.", "Pick mature crops and prepare for market.": "முதிர்ந்த பயிர்களை அறுவடை செய்யவும்.", "Plough deeply and plant rhizomes/setts/saplings.": "ஆழமாக உழுது கிழங்குகளை நடவும்.", "Weed and earth up the soil around the base.": "களை எடுத்து செடியின் அடிப்பகுதியில் மண் அணைக்கவும்.", "Apply main dose of recommended fertilizer.": "பரிந்துரைக்கப்பட்ட உரத்தின் முக்கிய பங்கை இடவும்.", "Maintain strict irrigation schedules.": "முறையான நீர்ப்பாசன அட்டவணையை பின்பற்றவும்.", "Harvest fully matured crop.": "முழுமையாக முதிர்ந்த பயிரை அறுவடை செய்யவும்.", "Prune dead branches and prepare water basins.": "காய்ந்த கிளைகளை வெட்டி பாத்திகளை அமைக்கவும்.", "Apply recommended fertilizer before the rains.": "மழைக்கு முன் உரத்தை இடவும்.", "Clear basin weeds and monitor for fungal pests.": "களைகளை அகற்றி பூஞ்சை நோய்களை கண்காணிக்கவும்.", "Ensure adequate water during fruit setting.": "பழங்கள் உருவாகும் நேரத்தில் தண்ணீர் இருப்பதை உறுதி செய்யவும்.", "Harvest mature yield.": "முதிர்ந்த மகசூலை அறுவடை செய்யவும்.", "Plough field and sow seeds.": "நிலத்தை உழுது விதைகளை விதைக்கவும்.", "Remove weeds and monitor early growth.": "களைகளை அகற்றி ஆரம்பகால வளர்ச்சியை கண்காணிக்கவும்.", "Apply recommended fertilizer for healthy development.": "வளர்ச்சிக்கு பரிந்துரைக்கப்பட்ட உரத்தை இடவும்.", "Monitor for pests during seed/pod formation.": "பூச்சிகளை கண்காணிக்கவும்.", "Harvest and process for the market.": "அறுவடை செய்து சந்தைக்கு தயார் செய்யவும்." },
    crops: { "Rice": "நெல்", "Wheat": "கோதுமை", "Maize": "மக்காச்சோளம்", "Ragi (Finger Millet)": "கேழ்வரகு", "Black Gram (Urad)": "உளுந்து", "Cotton": "பருத்தி", "Sugarcane": "கரும்பு", "Turmeric": "மஞ்சள்", "Coconut": "தேங்காய்", "Tapioca (Cassava)": "மரவள்ளிக்கிழங்கு", "Groundnut": "நிலக்கடலை", "Tomato": "தக்காளி", "Onion": "வெங்காயம்", "Banana": "வாழை", "Mango": "மாம்பழம்" },
    fertilizers: { "Organic Compost (Nutrients optimal)": "இயற்கை உரம்", "Urea (Nitrogen-rich)": "யூரியா (நைட்ரஜன் தேவை)", "DAP (Phosphorus-rich)": "DAP (பாஸ்பரஸ் தேவை)", "MOP / Potash (Potassium-rich)": "பொட்டாஷ் (பொட்டாசியம் தேவை)" },
    irrigations: { "Drip Irrigation (Highly water-efficient)": "சொட்டு நீர் பாசனம்", "Surface/Flood Irrigation (Requires heavy water)": "வாய்க்கால் பாசனம்", "Micro-Sprinkler / Rain Pipe": "தெளிப்பு நீர் பாசனம்" },
    schemes: { "PM-KISAN Samman Nidhi": "பிஎம்-கிசான் உதவித்தொகை", "TN Micro Irrigation Scheme": "தமிழக நுண்நீர்ப்பாசனத் திட்டம்", "PM Fasal Bima Yojana (Crop Insurance)": "பயிர் காப்பீட்டுத் திட்டம் (PMFBY)", "Uzhavar Pathukappu Thittam (TN)": "உழவர் பாதுகாப்புத் திட்டம் (TN)" },
    diseases: { "Early Blight (Simulated Data)": "இலைப்புள்ளி நோய் (Early Blight)" },
    treatments: { "Prune infected leaves. Apply a copper-based fungicide to the lower canopy.": "பாதிக்கப்பட்ட இலைகளை கத்தரிக்கவும். தாமிர அடிப்படையிலான பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." },
    days: { "Mon": "திங்கள்", "Tue": "செவ்வாய்", "Wed": "புதன்", "Thu": "வியாழன்", "Fri": "வெள்ளி", "Sat": "சனி", "Sun": "ஞாயிறு" }
  }
};

const soilAverages = {
  "Red Soil": { nitrogen: 40, phosphorus: 20, potassium: 40, ph: 6.5 },
  "Black Soil": { nitrogen: 50, phosphorus: 30, potassium: 60, ph: 7.5 },
  "Alluvial Soil": { nitrogen: 60, phosphorus: 40, potassium: 50, ph: 7.0 },
};

const generateHistoricalData = (currentPrice) => {
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']; 
  return months.map(month => ({ name: month, price: Math.round(currentPrice * (1 + (Math.random() * 0.3 - 0.15))) }));
};

function App() {
  const [lang, setLang] = useState('en'); 
  const [view, setView] = useState('home'); 
  const [activeTab, setActiveTab] = useState('crop'); 

  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [user, setUser] = useState(null); 
  const [role, setRole] = useState(null); 
  
  const [formData, setFormData] = useState({ location: '', soilType: '', nitrogen: '', phosphorus: '', potassium: '', ph: '', land: '' });
  const [recommendations, setRecommendations] = useState(null);
  const [schemes, setSchemes] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [analyzingDisease, setAnalyzingDisease] = useState(false);

  const [weatherLoc, setWeatherLoc] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherErr, setWeatherErr] = useState('');

  const [ledgerData, setLedgerData] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ category: 'catSeeds', amount: '', description: '' });
  const [loadingLedger, setLoadingLedger] = useState(false);

  const [userHistory, setUserHistory] = useState([]); 
  const [adminData, setAdminData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(localStorage.getItem('userEmail')); setRole(localStorage.getItem('userRole'));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let mappedValue = value;
    if (value === "செம்மண்") mappedValue = "Red Soil";
    if (value === "கரிசல் மண்") mappedValue = "Black Soil";
    if (value === "வண்டல் மண்") mappedValue = "Alluvial Soil";
    if (name === "soilType" && soilAverages[mappedValue]) {
      setFormData({ ...formData, soilType: mappedValue, nitrogen: soilAverages[mappedValue].nitrogen, phosphorus: soilAverages[mappedValue].phosphorus, potassium: soilAverages[mappedValue].potassium, ph: soilAverages[mappedValue].ph });
    } else {
      setFormData({ ...formData, [name]: mappedValue });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setRecommendations(null); setSchemes(null);
    try {
      const payload = { ...formData, nitrogen: Number(formData.nitrogen), phosphorus: Number(formData.phosphorus), potassium: Number(formData.potassium), ph: Number(formData.ph), land: Number(formData.land) };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/crops/recommend', payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setRecommendations(response.data.recommendations); setSchemes(response.data.schemes); 
    } catch (err) { setError("Unable to connect to the server."); } finally { setLoading(false); }
  };

  const handleDiseaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return alert("Please select an image first.");
    setAnalyzingDisease(true);
    const data = new FormData(); data.append('image', selectedImage);
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/disease/detect', data, { headers: { 'Content-Type': 'multipart/form-data', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        setDiseaseResult(response.data);
    } catch (err) { alert("Failed to analyze the leaf."); } finally { setAnalyzingDisease(false); }
  };

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoadingWeather(true); setWeatherErr(''); setForecast(null);
    try {
        const response = await axios.get(`http://localhost:5000/api/weather/forecast?location=${weatherLoc}`);
        setForecast(response.data);
    } catch (err) { setWeatherErr("Location not found."); } finally { setLoadingWeather(false); }
  };

  const fetchLedger = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5000/api/auth/ledger', { headers: { Authorization: `Bearer ${token}` } });
      setLedgerData(response.data);
    } catch (err) {}
  };

  const handleLedgerSubmit = async (e) => {
    e.preventDefault();
    setLoadingLedger(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/ledger', expenseForm, { headers: { Authorization: `Bearer ${token}` } });
      setLedgerData(response.data);
      setExpenseForm({ category: 'catSeeds', amount: '', description: '' });
    } catch (err) { alert("Failed to save expense"); } finally { setLoadingLedger(false); }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'ledger') fetchLedger();
  };

  const exportPDF = () => {
    const input = document.getElementById('pdf-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FarmShield-Intelligence-Report-${new Date().toLocaleDateString()}.pdf`);
    });
  };

  // MISSING FUNCTION RESTORED HERE:
  const handleAuthChange = (e) => setAuthData({ ...authData, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:5000${endpoint}`, authData);
      if (type === 'login') {
        localStorage.setItem('token', response.data.token); localStorage.setItem('userEmail', response.data.email); localStorage.setItem('userRole', response.data.role); 
        setUser(response.data.email); setRole(response.data.role); setView('home');
      } else { alert("Registration successful! Please log in."); setView('login'); }
    } catch (err) { alert(err.response?.data?.message || "Authentication failed"); }
  };

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/history', { headers: { Authorization: `Bearer ${token}` } });
      setUserHistory(res.data); setView('dashboard');
    } catch (err) { setUser(null); setRole(null); localStorage.clear(); setView('login'); }
  };

  const loadAdminPanel = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/admin/overview', { headers: { Authorization: `Bearer ${token}` } });
      setAdminData(res.data); setView('admin');
    } catch (err) { alert("Access denied. Admin privileges required."); }
  };
  
  return (
    <>
      <header>
        <nav className="navbar" style={{position: 'relative', zIndex: 10}}>
          <div className="logo" onClick={() => setView('home')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#188038" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            Farm<span>Shield</span>
          </div>
          <ul className="nav-links">
            <li><a href="#home" onClick={() => setView('home')} style={{color: view==='home' ? '#188038' : ''}}>{t[lang].home}</a></li>
            {user && <li><a href="#dashboard" onClick={loadDashboard} style={{color: view==='dashboard' ? '#188038' : ''}}>{t[lang].dashboard}</a></li>}
            {role === 'admin' && <li><a href="#admin" onClick={loadAdminPanel} style={{color: view==='admin' ? '#188038' : ''}}>{t[lang].admin}</a></li>}
          </ul>
          
          <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f1f3f4', padding: '4px', borderRadius: '8px', display: 'flex', cursor: 'pointer', border: '1px solid #dadce0' }}>
              <span onClick={() => setLang('en')} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', background: lang === 'en' ? '#188038' : 'transparent', color: lang === 'en' ? 'white' : '#5f6368', transition: '0.2s' }}>EN</span>
              <span onClick={() => setLang('ta')} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', background: lang === 'ta' ? '#188038' : 'transparent', color: lang === 'ta' ? 'white' : '#5f6368', transition: '0.2s' }}>தமிழ்</span>
            </div>

            {user ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', background: '#f8f9fa', padding: '6px 14px', borderRadius: '24px', border: '1px solid #dadce0'}}>
                <div style={{width: '28px', height: '28px', background: '#188038', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'}}>{user.charAt(0).toUpperCase()}</div>
                <span style={{fontWeight: '500', color: '#202124', fontSize: '14px'}}>{user.split('@')[0]}</span>
                <button onClick={() => {setUser(null); setRole(null); localStorage.clear(); setView('login');}} style={{marginLeft: '4px', background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>{t[lang].logout}</button>
              </div>
            ) : (
              <>
                <button className="login-btn" onClick={() => setView('login')} style={{background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>{t[lang].login}</button>
                <button className="register-btn" onClick={() => setView('register')} style={{fontSize: '14px', fontWeight: '500'}}>{t[lang].register}</button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <section style={{ minHeight: '70vh', padding: '60px 7%' }}>
          <h2 style={{ color: '#202124', textAlign: 'center', marginBottom: '40px', fontSize: '28px', fontWeight: '400' }}>{t[lang].historyTitle}</h2>
          {userHistory.length === 0 ? ( <p style={{textAlign: 'center', color: '#5f6368', fontSize: '15px'}}>{t[lang].noHistory}</p> ) : (
            <div style={{display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'}}>
              {userHistory.map((record, i) => (
                <div key={i} className="dashboard-card" style={{padding: '24px', background: 'white', borderRadius: '8px', border: '1px solid #dadce0'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dadce0', paddingBottom: '16px', marginBottom: '16px'}}>
                    <h3 style={{color: '#202124', margin: 0, fontSize: '18px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#188038" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>{record.location}</h3>
                    <p style={{fontSize: '13px', color: '#5f6368', margin: 0}}>{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {record.recommendedCrops.map((crop, j) => (
                      <div key={j} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                        <span style={{fontWeight: '500', color: '#3c4043'}}>{t[lang].crops[crop.cropName] || crop.cropName}</span>
                        <span style={{color: '#188038', fontWeight: '600'}}>₹{crop.expectedProfit.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* AUTH */}
      {(view === 'login' || view === 'register') && (
        <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', width: '100%', padding: '40px 0' }}>
          <div style={{ maxWidth: '420px', margin: 'auto', width: '100%', padding: '48px 40px', background: 'white', border: '1px solid #dadce0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(60,64,67,0.05)' }}>
            <div style={{textAlign: 'center', marginBottom: '32px'}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#188038" strokeWidth="2" style={{marginBottom: '16px'}}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg><h2 style={{color: '#202124', fontSize: '24px', fontWeight: '400'}}>{view === 'login' ? t[lang].welcomeBack : t[lang].createAccount}</h2></div>
            <form onSubmit={(e) => handleAuthSubmit(e, view)} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <input type="email" name="email" placeholder="Email" onChange={handleAuthChange} required style={{padding: '14px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '16px'}} />
              <input type="password" name="password" placeholder={t[lang].password} onChange={handleAuthChange} required style={{padding: '14px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '16px'}} />
              <button type="submit" className="submit-btn">{view === 'login' ? t[lang].login : t[lang].register}</button>
            </form>
          </div>
        </section>
      )}

      {/* WORKSPACE (HOME) - TABBED INTERFACE */}
      {view === 'home' && (
        <section style={{ padding: '40px 7%', background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          
          <div style={{ maxWidth: '960px', margin: '0 auto', background: 'white', borderRadius: '12px', border: '1px solid #dadce0', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)' }}>
            
            <div style={{ display: 'flex', borderBottom: '1px solid #dadce0', background: '#f8f9fa', overflowX: 'auto' }}>
              <button onClick={() => switchTab('crop')} style={{ flex: 1, minWidth: '150px', padding: '16px', background: activeTab === 'crop' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'crop' ? '3px solid #188038' : '3px solid transparent', color: activeTab === 'crop' ? '#188038' : '#5f6368', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> {t[lang].tabCrop}
              </button>
              <button onClick={() => switchTab('disease')} style={{ flex: 1, minWidth: '150px', padding: '16px', background: activeTab === 'disease' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'disease' ? '3px solid #188038' : '3px solid transparent', color: activeTab === 'disease' ? '#188038' : '#5f6368', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> {t[lang].tabDisease}
              </button>
              <button onClick={() => switchTab('weather')} style={{ flex: 1, minWidth: '150px', padding: '16px', background: activeTab === 'weather' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'weather' ? '3px solid #188038' : '3px solid transparent', color: activeTab === 'weather' ? '#188038' : '#5f6368', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg> {t[lang].tabWeather}
              </button>
              
              <button onClick={() => switchTab('ledger')} style={{ flex: 1, minWidth: '150px', padding: '16px', background: activeTab === 'ledger' ? 'white' : 'transparent', border: 'none', borderBottom: activeTab === 'ledger' ? '3px solid #188038' : '3px solid transparent', color: activeTab === 'ledger' ? '#188038' : '#5f6368', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> {t[lang].tabLedger}
              </button>
            </div>

            <div style={{ padding: '40px' }}>
              
              {/* TAB 1: CROP RECOMMENDATION */}
              {activeTab === 'crop' && (
                <div>
                  <h2 style={{ color: "#202124", marginBottom: "8px", fontSize: "24px", fontWeight: "400" }}>{t[lang].formTitle}</h2>
                  <p style={{ color: "#5f6368", marginBottom: "32px" }}>{t[lang].formSub}</p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px'}}>
                      <div className="form-group"><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].location}</label><input type="text" name="location" onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                      <div className="form-group">
                        <label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].soilType}</label>
                        <select name="soilType" onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}}><option value="">{t[lang].selectSoil}</option><option>{t[lang].redSoil}</option><option>{t[lang].blackSoil}</option><option>{t[lang].alluvialSoil}</option></select>
                      </div>
                      <div className="form-group"><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].nitrogen}</label><input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                      <div className="form-group"><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].phosphorus}</label><input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                      <div className="form-group"><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].potassium}</label><input type="number" name="potassium" value={formData.potassium} onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                      <div className="form-group"><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].ph}</label><input type="number" name="ph" step="0.1" value={formData.ph} onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                      <div className="form-group" style={{gridColumn: '1 / -1', maxWidth: '300px'}}><label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].landArea}</label><input type="number" name="land" step="0.1" onChange={handleChange} required style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} /></div>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading} style={{width: '100%', padding: '14px', background: '#188038', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: '500'}}>{loading ? t[lang].analyzing : t[lang].getRecBtn}</button>
                  </form>

                  {error && <div style={{padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf', marginTop: '24px'}}>{error}</div>}
                  
                  {recommendations && (
                    <div id="pdf-content" style={{ marginTop: '40px', paddingTop: "40px", borderTop: "1px solid #dadce0" }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}><h3 style={{fontSize: '24px', fontWeight: '400', color: '#202124', margin: 0}}>{t[lang].resultsTitle} ({formData.location})</h3></div>
                      
                      <p style={{fontSize: "14px", color: "#5f6368", marginBottom: "32px", display: 'flex', gap: '16px', alignItems: 'center'}}>
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>🌡️ {recommendations[0].appliedWeather.temp}°C</span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>💧 {recommendations[0].appliedWeather.humidity}% {t[lang].humidity}</span>
                      </p>
                      
                      {recommendations.map((crop, index) => {
                        const chartData = generateHistoricalData(crop.livePricePerKg);
                        return (
                          <div key={index} className="crop-result" style={{ marginBottom: "32px", padding: "24px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dadce0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                              <h3 style={{ color: "#202124", margin: 0, fontSize: '20px', fontWeight: '500' }}>{t[lang].crops[crop.cropName] || crop.cropName}</h3>
                              <span style={{ fontWeight: "600", fontSize: '14px', background: crop.suitabilityScore > 80 ? '#e6f4ea' : '#fef7e0', color: crop.suitabilityScore > 80 ? '#137333' : '#b06000', padding: '4px 12px', borderRadius: '16px' }}>{crop.suitabilityScore}% {t[lang].match}</span>
                            </div>
                            
                            <div style={{ width: "100%", background: "#e8eaed", borderRadius: "4px", height: "6px", marginBottom: "24px" }}><div style={{ width: `${crop.suitabilityScore}%`, background: crop.suitabilityScore > 80 ? "#188038" : "#f29900", height: "100%", borderRadius: "4px" }}></div></div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginBottom: "24px" }}>
                              <div style={{display: 'flex', flexDirection: 'column'}}><span style={{color: '#5f6368', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600'}}>{t[lang].liveRate}</span><span style={{color: '#202124', fontWeight: '500'}}>₹{crop.livePricePerKg} / kg</span></div>
                              <div style={{display: 'flex', flexDirection: 'column', textAlign: 'right'}}><span style={{color: '#5f6368', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600'}}>{t[lang].profit}</span><span style={{color: '#188038', fontWeight: '600', fontSize: '18px'}}>₹{crop.expectedProfit.toLocaleString('en-IN')}</span></div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                              <div style={{ padding: "16px", background: "white", borderRadius: "8px", borderLeft: "4px solid #188038", border: '1px solid #dadce0' }}><p style={{ color: "#202124", margin: 0, fontSize: '14px' }}><span style={{display: 'block', color: '#5f6368', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600'}}>{t[lang].fertilizer}</span>{t[lang].fertilizers[crop.recommendedFertilizer] || crop.recommendedFertilizer}</p></div>
                              <div style={{ padding: "16px", background: "white", borderRadius: "8px", borderLeft: "4px solid #1a73e8", border: '1px solid #dadce0' }}><p style={{ color: "#202124", margin: 0, fontSize: '14px' }}><span style={{display: 'block', color: '#5f6368', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600'}}>{t[lang].irrigation}</span>{t[lang].irrigations[crop.recommendedIrrigation] || crop.recommendedIrrigation}</p></div>
                            </div>

                            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #dadce0" }}>
                              <h4 style={{ color: "#202124", fontSize: "16px", fontWeight: "500", marginBottom: "20px" }}>📅 {t[lang].calendarTitle}</h4>
                              <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                                {crop.calendar.map((step, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "16px", position: "relative" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#1a73e8", zIndex: 1, marginTop: '4px' }}></div>{idx !== crop.calendar.length - 1 && <div style={{ width: "2px", height: "100%", background: "#dadce0", position: "absolute", top: "16px" }}></div>}</div>
                                    <div style={{ paddingBottom: "12px" }}>
                                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#1a73e8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t[lang].calendarDays[step.day] || step.day}</span>
                                      <h5 style={{ margin: "4px 0", fontSize: "14px", color: "#202124", fontWeight: "600" }}>{t[lang].calendarTasks[step.task] || step.task}</h5>
                                      <p style={{ margin: 0, fontSize: "13px", color: "#5f6368", lineHeight: '1.4' }}>{t[lang].calendarDesc[step.desc] || step.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <button onClick={exportPDF} style={{ width: "100%", marginTop: "24px", padding: "14px", backgroundColor: "#188038", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "15px" }}>📥 {t[lang].downloadPdf}</button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AI DISEASE DETECTION */}
              {activeTab === 'disease' && (
                <div>
                  <h2 style={{ color: "#202124", marginBottom: "8px", fontSize: "24px", fontWeight: "400" }}>{t[lang].diseaseTitle}</h2>
                  <p style={{ color: "#5f6368", marginBottom: "32px" }}>{t[lang].diseaseSub}</p>
                  
                  <form onSubmit={handleDiseaseSubmit} style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} style={{ padding: "12px", border: "1px solid #dadce0", borderRadius: "4px", flexGrow: 1 }} />
                    <button type="submit" disabled={analyzingDisease} style={{ padding: "14px 32px", background: "#1a73e8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}>{analyzingDisease ? t[lang].scanningBtn : t[lang].scanBtn}</button>
                  </form>
                  
                  {diseaseResult && (
                    <div style={{ marginTop: "32px", padding: "24px", background: "#fce8e6", borderRadius: "8px", borderLeft: "4px solid #c5221f" }}>
                      <h4 style={{ color: "#c5221f", margin: "0 0 12px 0", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ {t[lang].diseases[diseaseResult.diseaseName] || diseaseResult.diseaseName} <span style={{fontSize: "13px", background: "#fad2cf", padding: "4px 10px", borderRadius: "16px", color: "#b31412"}}>{diseaseResult.confidence} {t[lang].match}</span></h4>
                      <p style={{ margin: 0, fontSize: "15px", color: "#202124", lineHeight: "1.6" }}><strong>{t[lang].treatmentTitle}:</strong> {t[lang].treatments[diseaseResult.treatment] || diseaseResult.treatment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WEATHER FORECAST */}
              {activeTab === 'weather' && (
                <div>
                  <h2 style={{ color: "#202124", marginBottom: "8px", fontSize: "24px", fontWeight: "400" }}>{t[lang].weatherTitle}</h2>
                  <p style={{ color: "#5f6368", marginBottom: "32px" }}>{t[lang].weatherSub}</p>

                  <form onSubmit={fetchWeather} style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: '32px' }}>
                    <input type="text" placeholder={t[lang].location} value={weatherLoc} onChange={(e) => setWeatherLoc(e.target.value)} required style={{ padding: "12px", border: "1px solid #dadce0", borderRadius: "4px", flexGrow: 1 }} />
                    <button type="submit" disabled={loadingWeather} style={{ padding: "14px 32px", background: "#1a73e8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}>{loadingWeather ? t[lang].fetchingWeather : t[lang].fetchWeatherBtn}</button>
                  </form>

                  {weatherErr && <div style={{padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf'}}>{weatherErr}</div>}

                  {forecast && (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px'}}>
                      {forecast.map((day, idx) => (
                        <div key={idx} style={{background: '#f8f9fa', padding: '24px 16px', borderRadius: '8px', border: '1px solid #dadce0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                          <h4 style={{margin: '0 0 12px 0', color: '#202124', fontSize: '16px'}}>{t[lang].days[day.date] || day.date}</h4>
                          {day.icon?.includes('http') ? <img src={day.icon} alt="weather icon" width="50"/> : <span style={{fontSize: '32px'}}>{day.icon}</span>}
                          <h2 style={{margin: '12px 0 4px 0', color: '#1a73e8', fontSize: '28px', fontWeight: '400'}}>{day.temp}°C</h2>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DIGITAL LEDGER */}
              {activeTab === 'ledger' && (
                <div>
                  {!user ? (
                    <div style={{textAlign: 'center', padding: '40px 0', color: '#5f6368'}}>Please log in to manage your Farm Ledger.</div>
                  ) : (
                    <>
                      <h2 style={{ color: "#202124", marginBottom: "8px", fontSize: "24px", fontWeight: "400" }}>{t[lang].ledgerTitle}</h2>
                      <p style={{ color: "#5f6368", marginBottom: "32px" }}>{t[lang].ledgerSub}</p>

                      <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                        <div style={{flex: '1 1 300px', background: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #dadce0'}}>
                          <h3 style={{fontSize: '16px', fontWeight: '500', marginBottom: '16px', color: '#202124'}}>{t[lang].addExpense}</h3>
                          <form onSubmit={handleLedgerSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div className="form-group">
                              <label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].expenseCat}</label>
                              <select required value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}}>
                                <option value="catSeeds">{t[lang].catSeeds}</option>
                                <option value="catLabor">{t[lang].catLabor}</option>
                                <option value="catFert">{t[lang].catFert}</option>
                                <option value="catEquip">{t[lang].catEquip}</option>
                                <option value="catTrans">{t[lang].catTrans}</option>
                                <option value="catOther">{t[lang].catOther}</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].amount}</label>
                              <input type="number" required value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} />
                            </div>
                            <div className="form-group">
                              <label style={{fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase'}}>{t[lang].desc}</label>
                              <input type="text" required value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} style={{padding: '12px', border: '1px solid #dadce0', borderRadius: '4px'}} />
                            </div>
                            <button type="submit" disabled={loadingLedger} style={{padding: '14px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}>{t[lang].addExpense}</button>
                          </form>
                        </div>

                        <div style={{flex: '2 1 400px'}}>
                          <div style={{padding: '24px', background: '#e6f4ea', borderRadius: '8px', border: '1px solid #ceead6', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                              <p style={{margin: '0 0 4px 0', fontSize: '13px', color: '#137333', fontWeight: '600', textTransform: 'uppercase'}}>{t[lang].totalExpenses}</p>
                              <h2 style={{margin: 0, fontSize: '32px', color: '#0d652d', fontWeight: '400'}}>
                                ₹{ledgerData.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString('en-IN')}
                              </h2>
                            </div>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                          </div>

                          <div style={{background: 'white', borderRadius: '8px', border: '1px solid #dadce0', overflow: 'hidden'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                              <thead>
                                <tr style={{background: '#f8f9fa', textAlign: 'left'}}>
                                  <th style={{padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600'}}>{t[lang].date}</th>
                                  <th style={{padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600'}}>{t[lang].expenseCat}</th>
                                  <th style={{padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600'}}>{t[lang].desc}</th>
                                  <th style={{padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600', textAlign: 'right'}}>{t[lang].amount}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ledgerData.length === 0 ? (
                                  <tr><td colSpan="4" style={{padding: '24px', textAlign: 'center', color: '#5f6368'}}>No expenses logged yet.</td></tr>
                                ) : (
                                  ledgerData.map((item, idx) => (
                                    <tr key={idx} style={{borderBottom: '1px solid #dadce0'}}>
                                      <td style={{padding: '12px 16px', fontSize: '14px', color: '#5f6368'}}>{new Date(item.date).toLocaleDateString()}</td>
                                      <td style={{padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#202124'}}>{t[lang][item.category] || item.category}</td>
                                      <td style={{padding: '12px 16px', fontSize: '14px', color: '#5f6368'}}>{item.description}</td>
                                      <td style={{padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#d93025', textAlign: 'right'}}>-₹{item.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default App;