import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cropApi } from '../../services/api';
import { SOIL_OPTIONS, getSoilAverages, getPriceTrends } from '../../constants/soilData';

export default function CropIntelligence({ t, lang }) {
  const [formData, setFormData] = useState({
    location: '',
    soilType: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    land: '',
  });

  const [recommendations, setRecommendations] = useState(null);
  const [schemes, setSchemes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'soilType') {
      const avgs = getSoilAverages(value);
      if (avgs) {
        setFormData((prev) => ({
          ...prev,
          soilType: value,
          nitrogen: avgs.nitrogen,
          phosphorus: avgs.phosphorus,
          potassium: avgs.potassium,
          ph: avgs.ph,
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations(null);
    setSchemes(null);

    try {
      const payload = {
        ...formData,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        ph: Number(formData.ph),
        land: Number(formData.land),
      };

      const response = await cropApi.getRecommendations(payload);
      setRecommendations(response.data.recommendations);
      setSchemes(response.data.schemes);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the recommendation service.');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FarmShield-Intelligence-Report-${new Date().toLocaleDateString()}.pdf`);
    });
  };

  return (
    <div>
      <h2 style={{ color: '#202124', marginBottom: '8px', fontSize: '24px', fontWeight: '400' }}>
        {t.formTitle}
      </h2>
      <p style={{ color: '#5f6368', marginBottom: '32px' }}>{t.formSub}</p>

      <form onSubmit={handleSubmit}>
        <div
          className="form-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.location}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Coimbatore"
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.soilType}
            </label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            >
              <option value="">{t.selectSoil}</option>
              {SOIL_OPTIONS.map((soil) => (
                <option key={soil.key} value={soil.key}>
                  {t[soil.labelKey] || soil.defaultLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.nitrogen}
            </label>
            <input
              type="number"
              name="nitrogen"
              value={formData.nitrogen}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.phosphorus}
            </label>
            <input
              type="number"
              name="phosphorus"
              value={formData.phosphorus}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.potassium}
            </label>
            <input
              type="number"
              name="potassium"
              value={formData.potassium}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.ph}
            </label>
            <input
              type="number"
              name="ph"
              step="0.1"
              value={formData.ph}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', maxWidth: '300px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
              {t.landArea}
            </label>
            <input
              type="number"
              name="land"
              step="0.1"
              value={formData.land}
              onChange={handleChange}
              required
              style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#188038',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500',
          }}
        >
          {loading ? t.analyzing : t.getRecBtn}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: '16px',
            background: '#fce8e6',
            color: '#c5221f',
            borderRadius: '8px',
            border: '1px solid #fad2cf',
            marginTop: '24px',
          }}
        >
          {error}
        </div>
      )}

      {recommendations && (
        <div id="pdf-content" style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #dadce0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '400', color: '#202124', margin: 0 }}>
              {t.resultsTitle} ({formData.location})
            </h3>
          </div>

          {recommendations[0]?.appliedWeather && (
            <p
              style={{
                fontSize: '14px',
                color: '#5f6368',
                marginBottom: '32px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                🌡️ {recommendations[0].appliedWeather.temp}°C
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                💧 {recommendations[0].appliedWeather.humidity}% {t.humidity}
              </span>
            </p>
          )}

          {recommendations.map((crop, index) => {
            const chartData = getPriceTrends(crop.livePricePerKg);

            return (
              <div
                key={index}
                className="crop-result"
                style={{
                  marginBottom: '32px',
                  padding: '24px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <h3 style={{ color: '#202124', margin: 0, fontSize: '20px', fontWeight: '500' }}>
                    {t.crops[crop.cropName] || crop.cropName}
                  </h3>
                  <span
                    style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      background: crop.suitabilityScore > 80 ? '#e6f4ea' : '#fef7e0',
                      color: crop.suitabilityScore > 80 ? '#137333' : '#b06000',
                      padding: '4px 12px',
                      borderRadius: '16px',
                    }}
                  >
                    {crop.suitabilityScore}% {t.match}
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    background: '#e8eaed',
                    borderRadius: '4px',
                    height: '6px',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      width: `${crop.suitabilityScore}%`,
                      background: crop.suitabilityScore > 80 ? '#188038' : '#f29900',
                      height: '100%',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '15px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        color: '#5f6368',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600',
                      }}
                    >
                      {t.liveRate}
                    </span>
                    <span style={{ color: '#202124', fontWeight: '500' }}>
                      ₹{crop.livePricePerKg} / kg
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                    <span
                      style={{
                        color: '#5f6368',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600',
                      }}
                    >
                      {t.profit}
                    </span>
                    <span style={{ color: '#188038', fontWeight: '600', fontSize: '18px' }}>
                      ₹{crop.expectedProfit?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      borderLeft: '4px solid #188038',
                      border: '1px solid #dadce0',
                    }}
                  >
                    <p style={{ color: '#202124', margin: 0, fontSize: '14px' }}>
                      <span
                        style={{
                          display: 'block',
                          color: '#5f6368',
                          fontSize: '12px',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                        }}
                      >
                        {t.fertilizer}
                      </span>
                      {t.fertilizers[crop.recommendedFertilizer] || crop.recommendedFertilizer}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      borderLeft: '4px solid #1a73e8',
                      border: '1px solid #dadce0',
                    }}
                  >
                    <p style={{ color: '#202124', margin: 0, fontSize: '14px' }}>
                      <span
                        style={{
                          display: 'block',
                          color: '#5f6368',
                          fontSize: '12px',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                        }}
                      >
                        {t.irrigation}
                      </span>
                      {t.irrigations[crop.recommendedIrrigation] || crop.recommendedIrrigation}
                    </p>
                  </div>
                </div>

                {/* 6-MONTH PRICE TREND CHART */}
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                  }}
                >
                  <h5
                    style={{
                      margin: '0 0 16px 0',
                      fontSize: '13px',
                      color: '#5f6368',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    }}
                  >
                    📊 {t.trend}
                  </h5>
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                        <XAxis dataKey="name" stroke="#5f6368" fontSize={12} />
                        <YAxis stroke="#5f6368" fontSize={12} unit="₹" />
                        <Tooltip
                          formatter={(value) => [`₹${value}/kg`, 'Projected Rate']}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dadce0' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#188038"
                          strokeWidth={2.5}
                          dot={{ fill: '#188038', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DYNAMIC CROP LIFECYCLE CALENDAR */}
                {crop.calendar && crop.calendar.length > 0 && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #dadce0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ color: '#202124', fontSize: '16px', fontWeight: '500', margin: 0 }}>
                        📅 {t.calendarTitle}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {crop.cropType && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#188038', background: '#e6f4ea', padding: '3px 10px', borderRadius: '12px' }}>
                            {crop.cropType}
                          </span>
                        )}
                        {crop.duration && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#1a73e8', background: '#e8f0fe', padding: '3px 10px', borderRadius: '12px' }}>
                            ⏳ {crop.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                      {crop.calendar.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#1a73e8',
                                zIndex: 1,
                                marginTop: '4px',
                              }}
                            />
                            {idx !== crop.calendar.length - 1 && (
                              <div
                                style={{
                                  width: '2px',
                                  height: '100%',
                                  background: '#dadce0',
                                  position: 'absolute',
                                  top: '16px',
                                }}
                              />
                            )}
                          </div>
                          <div style={{ paddingBottom: '12px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#1a73e8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {t.calendarDays?.[step.day] || step.day}
                            </span>
                            <h5 style={{ margin: '4px 0', fontSize: '14px', color: '#202124', fontWeight: '600' }}>
                              {t.calendarTasks?.[step.task] || step.task}
                            </h5>
                            <p style={{ margin: 0, fontSize: '13px', color: '#5f6368', lineHeight: '1.4' }}>
                              {t.calendarDesc?.[step.desc] || step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* GOVERNMENT SUBSIDIES & SCHEMES */}
          {schemes && schemes.length > 0 && (
            <div
              style={{
                marginTop: '32px',
                padding: '24px',
                background: '#e8f0fe',
                borderRadius: '8px',
                border: '1px solid #d2e3fc',
              }}
            >
              <h4
                style={{
                  color: '#174ea6',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🏛️ {t.schemesTitle}
              </h4>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {schemes.map((scheme, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #dadce0',
                    }}
                  >
                    <h5 style={{ margin: '0 0 6px 0', color: '#202124', fontSize: '15px', fontWeight: '600' }}>
                      {t.schemes[scheme.name] || scheme.name}
                    </h5>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#5f6368' }}>{scheme.desc}</p>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#137333',
                        background: '#e6f4ea',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {scheme.eligibility}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={exportPDF}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '14px',
              backgroundColor: '#188038',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '15px',
            }}
          >
            📥 {t.downloadPdf}
          </button>
        </div>
      )}
    </div>
  );
}
