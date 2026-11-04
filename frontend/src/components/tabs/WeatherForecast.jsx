import { useState, useEffect } from 'react';
import { weatherApi } from '../../services/api';

const TN_DISTRICTS = [
  "Coimbatore", "Thanjavur", "Madurai", "Chennai", "Tiruchirappalli",
  "Salem", "Erode", "Tirunelveli", "Dindigul", "The Nilgiris",
  "Cuddalore", "Vellore", "Theni", "Dharmapuri", "Kanchipuram",
  "Thoothukudi", "Villupuram", "Nagapattinam", "Namakkal", "Karur",
  "Pudukkottai", "Ramanathapuram", "Sivaganga", "Tiruvannamalai", "Virudhunagar"
];

export default function WeatherForecast({ t }) {
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore');
  const [customCity, setCustomCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherErr, setWeatherErr] = useState('');

  const fetchWeatherFor = async (locationName) => {
    if (!locationName) return;
    setLoadingWeather(true);
    setWeatherErr('');
    try {
      const response = await weatherApi.getForecast(locationName);
      setWeatherData(response.data);
    } catch (err) {
      setWeatherErr(err.response?.data?.message || 'Location not found or weather service unavailable.');
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeatherFor(selectedDistrict);
  }, [selectedDistrict]);

  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    fetchWeatherFor(customCity.trim());
  };

  const currentAdv = weatherData?.currentAdvisories || {};

  return (
    <div>
      <h2 style={{ color: '#202124', marginBottom: '8px', fontSize: '24px', fontWeight: '400' }}>
        🌦️ {t.weatherTitle}
      </h2>
      <p style={{ color: '#5f6368', marginBottom: '24px' }}>{t.weatherSub}</p>

      {/* DISTRICT SELECTOR & CUSTOM SEARCH */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              📍 {t.selectDistrict}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCustomCity('');
              }}
              style={{ width: '100%', padding: '12px', border: '1px solid #dadce0', borderRadius: '4px', background: 'white', fontSize: '15px' }}
            >
              {TN_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              🔍 {t.orTypeCity}
            </label>
            <form onSubmit={handleCustomCitySubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. Pollachi, Ooty, Delhi"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                style={{ flex: 1, padding: '11px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={loadingWeather}
                style={{ padding: '11px 18px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {weatherErr && (
        <div style={{ padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf', marginBottom: '24px' }}>
          {weatherErr}
        </div>
      )}

      {loadingWeather && (
        <p style={{ textAlign: 'center', color: '#5f6368', padding: '30px 0' }}>
          Fetching hyper-local meteorological telemetry...
        </p>
      )}

      {/* FORECAST & ADVISORIES DISPLAY */}
      {weatherData && weatherData.forecast && !loadingWeather && (
        <div>
          {/* AGRONOMIC ADVISORY BANNER (FEATURE ADDITION) */}
          <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#202124', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚜 24-48 Hour Agronomic Advisories ({weatherData.location})
              </h3>
              <span style={{ fontSize: '12px', background: '#e6f4ea', color: '#137333', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                Live Agronomy Telemetry
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* SPRAY ADVISORY */}
              {currentAdv.sprayAdvisory && (
                <div style={{ background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #dadce0', borderLeft: `4px solid ${currentAdv.sprayAdvisory.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368' }}>{t.sprayAdvisoryTitle}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: currentAdv.sprayAdvisory.color }}>{currentAdv.sprayAdvisory.badge}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#3c4043', lineHeight: '1.4' }}>
                    {currentAdv.sprayAdvisory.desc}
                  </p>
                </div>
              )}

              {/* IRRIGATION GUIDANCE */}
              {currentAdv.irrigationAdvisory && (
                <div style={{ background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #dadce0', borderLeft: `4px solid ${currentAdv.irrigationAdvisory.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368' }}>{t.irrigationAdvisoryTitle}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: currentAdv.irrigationAdvisory.color }}>{currentAdv.irrigationAdvisory.badge}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#3c4043', lineHeight: '1.4' }}>
                    {currentAdv.irrigationAdvisory.desc}
                  </p>
                </div>
              )}

              {/* FUNGAL / DISEASE RISK */}
              {currentAdv.diseaseRisk && (
                <div style={{ background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #dadce0', borderLeft: `4px solid ${currentAdv.diseaseRisk.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#5f6368' }}>{t.diseaseRiskTitle}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: currentAdv.diseaseRisk.color }}>{currentAdv.diseaseRisk.badge}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#3c4043', lineHeight: '1.4' }}>
                    {currentAdv.diseaseRisk.desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 5-DAY OUTLOOK CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {weatherData.forecast.map((day, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  padding: '20px 16px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <h4 style={{ margin: '0 0 2px 0', color: '#202124', fontSize: '16px', fontWeight: '600' }}>
                  {t.days[day.date] || day.date}
                </h4>
                {day.fullDate && (
                  <span style={{ fontSize: '11px', color: '#80868b', marginBottom: '8px' }}>{day.fullDate}</span>
                )}

                {day.icon?.includes('http') ? (
                  <img src={day.icon} alt={day.desc || 'weather icon'} width="56" height="56" style={{ margin: '4px 0' }} />
                ) : (
                  <span style={{ fontSize: '36px', margin: '4px 0' }}>{day.icon}</span>
                )}

                <h2 style={{ margin: '6px 0 2px 0', color: '#1a73e8', fontSize: '26px', fontWeight: '500' }}>
                  {day.temp}°C
                </h2>
                <span style={{ fontSize: '12px', color: '#5f6368', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {day.desc}
                </span>

                <div style={{ width: '100%', borderTop: '1px solid #f1f3f4', paddingTop: '8px', marginTop: '4px', fontSize: '11px', color: '#5f6368', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div>💧 {day.humidity}% humidity</div>
                  <div>💨 {day.windSpeed} km/h wind</div>
                  <div>🌧️ {day.rainProb}% rain prob</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
