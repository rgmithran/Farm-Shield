import { useState, useEffect } from 'react';
import { authApi, cropApi } from '../../services/api';

export default function AdminView({ t, setView }) {
  const [adminData, setAdminData] = useState([]);
  const [cropsList, setCropsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({
    cropName: '',
    idealNitrogen: 60,
    idealPhosphorus: 30,
    idealPotassium: 40,
    idealPh: 6.5,
    idealTemp: 26,
    idealHumidity: 65,
    idealRainfall: 120,
    marketPricePerKg: 35,
    cultivationCostPerAcre: 18000
  });
  const [savingCrop, setSavingCrop] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, cropsRes] = await Promise.all([
        authApi.getAdminOverview(),
        cropApi.getAll()
      ]);
      setAdminData(overviewRes.data || []);
      setCropsList(cropsRes.data.crops || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Administrator privileges required.');
      } else {
        setError('Failed to fetch platform analytics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setSavingCrop(true);
    try {
      await cropApi.create(newCrop);
      alert('Crop successfully created in MongoDB database!');
      setShowAddCrop(false);
      setNewCrop({
        cropName: '', idealNitrogen: 60, idealPhosphorus: 30, idealPotassium: 40,
        idealPh: 6.5, idealTemp: 26, idealHumidity: 65, idealRainfall: 120,
        marketPricePerKg: 35, cultivationCostPerAcre: 18000
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add crop to MongoDB.');
    } finally {
      setSavingCrop(false);
    }
  };

  const handleDeleteCrop = async (cropId, cropName) => {
    if (!confirm(`Are you sure you want to delete "${cropName}" from MongoDB?`)) return;
    try {
      await cropApi.delete(cropId);
      setCropsList(cropsList.filter(c => c._id !== cropId));
      alert(`Deleted "${cropName}" from database.`);
    } catch (err) {
      alert('Failed to delete crop.');
    }
  };

  return (
    <section style={{ minHeight: '75vh', padding: '50px 7%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ color: '#202124', fontSize: '28px', fontWeight: '400', margin: '0 0 6px 0' }}>
            🛡️ {t.adminTitle}
          </h2>
          <p style={{ margin: 0, color: '#5f6368', fontSize: '14px' }}>
            Full Administrative Console: Global farmer search telemetry & MongoDB Database CRUD operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddCrop(!showAddCrop)}
            style={{
              padding: '10px 18px',
              background: '#188038',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            + Add Crop to MongoDB
          </button>
          <button
            onClick={() => setView('home')}
            style={{
              padding: '10px 18px',
              background: 'white',
              border: '1px solid #dadce0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: '#5f6368',
            }}
          >
            Back to Workspace
          </button>
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: '#5f6368', fontSize: '15px', padding: '40px 0' }}>
          Loading platform audit data & MongoDB collections...
        </p>
      )}

      {error && (
        <div
          style={{
            padding: '16px',
            background: '#fce8e6',
            color: '#c5221f',
            borderRadius: '8px',
            border: '1px solid #fad2cf',
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          {error}
        </div>
      )}

      {/* MODAL / FORM TO ADD CROP TO MONGODB */}
      {showAddCrop && (
        <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#202124' }}>
            Insert New Crop into MongoDB `crops` Collection
          </h3>
          <form onSubmit={handleCreateCrop} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Crop Name</label>
              <input type="text" required value={newCrop.cropName} onChange={(e) => setNewCrop({ ...newCrop, cropName: e.target.value })} placeholder="e.g. Cardamom" style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ideal Nitrogen (N)</label>
              <input type="number" required value={newCrop.idealNitrogen} onChange={(e) => setNewCrop({ ...newCrop, idealNitrogen: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ideal Phosphorus (P)</label>
              <input type="number" required value={newCrop.idealPhosphorus} onChange={(e) => setNewCrop({ ...newCrop, idealPhosphorus: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ideal Potassium (K)</label>
              <input type="number" required value={newCrop.idealPotassium} onChange={(e) => setNewCrop({ ...newCrop, idealPotassium: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ideal pH</label>
              <input type="number" step="0.1" required value={newCrop.idealPh} onChange={(e) => setNewCrop({ ...newCrop, idealPh: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Market Price (₹/kg)</label>
              <input type="number" required value={newCrop.marketPricePerKg} onChange={(e) => setNewCrop({ ...newCrop, marketPricePerKg: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Cultivation Cost/Acre (₹)</label>
              <input type="number" required value={newCrop.cultivationCostPerAcre} onChange={(e) => setNewCrop({ ...newCrop, cultivationCostPerAcre: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowAddCrop(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={savingCrop} style={{ padding: '8px 24px', background: '#188038', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                {savingCrop ? 'Saving...' : 'Save to Database'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 1: MONGODB CROPS DATABASE MANAGEMENT */}
      {!loading && !error && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#202124', fontWeight: '500' }}>
              📦 MongoDB `crops` Collection Management ({cropsList.length} documents)
            </h3>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #dadce0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>Crop Name</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>Ideal N-P-K</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>Ideal pH</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>Market Rate</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>Cost/Acre</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600', textAlign: 'center' }}>Database Action</th>
                </tr>
              </thead>
              <tbody>
                {cropsList.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #dadce0' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#202124' }}>{c.cropName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5f6368' }}>{c.idealNitrogen}-{c.idealPhosphorus}-{c.idealPotassium}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5f6368' }}>{c.idealPh}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#188038', fontWeight: '600' }}>₹{c.marketPricePerKg}/kg</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5f6368' }}>₹{c.cultivationCostPerAcre?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteCrop(c._id, c.cropName)}
                        style={{ padding: '4px 10px', background: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: GLOBAL SEARCH AUDIT TELEMETRY */}
      {!loading && !error && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#202124', fontWeight: '500' }}>
            📊 Global Farmer Recommendation History ({adminData.length} records)
          </h3>
          {adminData.length === 0 ? (
            <p style={{ color: '#5f6368' }}>{t.noAdminData}</p>
          ) : (
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                overflowX: 'auto',
                boxShadow: '0 1px 2px rgba(60,64,67,0.08)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '14px 18px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                      {t.date}
                    </th>
                    <th style={{ padding: '14px 18px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                      {t.email}
                    </th>
                    <th style={{ padding: '14px 18px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                      {t.location}
                    </th>
                    <th style={{ padding: '14px 18px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                      {t.topCrops}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #dadce0' }}>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#5f6368', whiteSpace: 'nowrap' }}>
                        {new Date(row.date).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                        {row.email}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#202124' }}>
                        {row.location}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', color: '#188038', fontWeight: '500' }}>
                        {row.crops}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
