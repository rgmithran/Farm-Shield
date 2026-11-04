import { useState, useEffect } from 'react';
import { cropApi } from '../../services/api';

export default function CropAgropedia({ t, lang }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState('');

  const fetchCrops = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await cropApi.getAll({ search, sortBy });
      setCrops(response.data.crops || []);
    } catch (err) {
      setError('Failed to query crops database from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCrops();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#202124', marginBottom: '6px', fontSize: '24px', fontWeight: '400', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🍃</span> {t.agropediaTitle}
          </h2>
          <p style={{ color: '#5f6368', margin: 0, fontSize: '14px' }}>
            {t.agropediaSub}
          </p>
        </div>
        <div style={{ background: '#e6f4ea', color: '#137333', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#188038' }}></span>
          MongoDB: {crops.length} Crops Active
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: '1 1 280px', gap: '8px' }}>
          <input
            type="text"
            placeholder={t.searchCrops}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px' }}
          />
          <button
            type="submit"
            style={{ padding: '10px 18px', background: '#188038', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: '#5f6368', fontWeight: '500' }}>{t.sortBy}:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px', background: 'white' }}
          >
            <option value="name">Alphabetical (A - Z)</option>
            <option value="price_desc">{t.priceHighLow}</option>
            <option value="cost_asc">{t.costLowHigh}</option>
            <option value="cost_desc">{t.costHighLow}</option>
          </select>
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
          Querying MongoDB documents...
        </p>
      )}

      {error && (
        <div style={{ padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf' }}>
          {error}
        </div>
      )}

      {!loading && !error && crops.length === 0 && (
        <p style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
          No crops matched your search.
        </p>
      )}

      {/* CROP DOCUMENT CARDS */}
      {!loading && crops.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
          {crops.map((crop) => (
            <div
              key={crop._id}
              className="dashboard-card"
              style={{
                background: 'white',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#202124', fontWeight: '600' }}>
                    {t.crops[crop.cropName] || crop.cropName}
                  </h3>
                  <span style={{ fontSize: '12px', background: '#e8f0fe', color: '#1a73e8', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    ₹{crop.marketPricePerKg} / kg
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', margin: '12px 0', padding: '10px 0', borderTop: '1px solid #f1f3f4', borderBottom: '1px solid #f1f3f4' }}>
                  <div>
                    <span style={{ color: '#5f6368', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>{t.idealNPK}</span>
                    <strong style={{ color: '#202124' }}>{crop.idealNitrogen} - {crop.idealPhosphorus} - {crop.idealPotassium}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#5f6368', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>{t.phRange}</span>
                    <strong style={{ color: '#202124' }}>pH {crop.idealPh}</strong>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ color: '#5f6368', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>{t.tempRainfall}</span>
                    <strong style={{ color: '#202124' }}>{crop.idealTemp}°C / {crop.idealRainfall}mm</strong>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ color: '#5f6368', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>{t.cultivationCostLabel}</span>
                    <strong style={{ color: '#137333' }}>₹{crop.cultivationCostPerAcre?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#80868b' }}>
                <span>ID: {crop._id.slice(-6)}</span>
                <span style={{ color: '#188038', fontWeight: '500' }}>MongoDB Record ✓</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
