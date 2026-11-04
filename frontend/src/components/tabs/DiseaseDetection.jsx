import { useState } from 'react';
import { diseaseApi } from '../../services/api';

const QUICK_TEST_SAMPLES = [
  { label: "Tomato Blight", crop: "Tomato", sample: "Tomato Early Blight", desc: "Target-board leaf spots" },
  { label: "Rice Blast", crop: "Rice", sample: "Rice Blast", desc: "Spindle-shaped diamond lesions" },
  { label: "Banana Sigatoka", crop: "Banana", sample: "Banana Black Sigatoka", desc: "Leaf streak necrosis" },
  { label: "Groundnut Tikka", crop: "Groundnut", sample: "Groundnut Tikka", desc: "Circular dark spots" },
  { label: "Healthy Leaf", crop: "Healthy", sample: "healthy", desc: "Optimal green lamina" }
];

export default function DiseaseDetection({ t }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropType, setCropType] = useState('All');
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [analyzingDisease, setAnalyzingDisease] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiseaseResult(null);
      setError('');
    }
  };

  const handleQuickSampleTest = async (sample) => {
    setAnalyzingDisease(true);
    setError('');
    setDiseaseResult(null);

    // Create a dummy mock file for the sample payload
    const dummyBlob = new Blob([sample.sample + Date.now()], { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("image", dummyBlob, `${sample.sample.toLowerCase().replace(/ /g, "_")}.jpg`);
    formData.append("cropType", sample.crop);
    formData.append("sampleType", sample.sample);

    try {
      const response = await diseaseApi.detectDisease(formData);
      setDiseaseResult(response.data);
      setPreviewUrl('');
      setSelectedImage(null);
    } catch (err) {
      setError("Failed to run sample diagnostic.");
    } finally {
      setAnalyzingDisease(false);
    }
  };

  const handleDiseaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please choose a leaf photo from your computer or use one of the quick test samples below.');
      return;
    }
    setAnalyzingDisease(true);
    setError('');

    const data = new FormData();
    data.append('image', selectedImage);
    if (cropType !== 'All') {
      data.append('cropType', cropType);
    }

    try {
      const response = await diseaseApi.detectDisease(data);
      setDiseaseResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze the leaf. Please try again.');
    } finally {
      setAnalyzingDisease(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: '#202124', marginBottom: '8px', fontSize: '24px', fontWeight: '400' }}>
        🔬 {t.diseaseTitle}
      </h2>
      <p style={{ color: '#5f6368', marginBottom: '24px' }}>{t.diseaseSub}</p>

      {/* QUICK EVALUATION TEST SAMPLES */}
      <div style={{ background: '#f8f9fa', padding: '16px 20px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '28px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#188038', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
          ⚡ {t.quickTestSamples}
        </span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {QUICK_TEST_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              disabled={analyzingDisease}
              onClick={() => handleQuickSampleTest(s)}
              style={{
                padding: '8px 14px',
                background: 'white',
                border: '1px solid #dadce0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#202124',
                transition: '0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#188038'; e.currentTarget.style.color = '#188038'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.color = '#202124'; }}
            >
              <span>🌿</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* FORM UPLOAD */}
      <form onSubmit={handleDiseaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {t.selectCropOptional}
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #dadce0', borderRadius: '4px', background: 'white' }}
            >
              <option value="All">All Crops / Auto-Detect</option>
              <option value="Tomato">Tomato (தக்காளி)</option>
              <option value="Rice">Rice / Paddy (நெல்)</option>
              <option value="Wheat">Wheat (கோதுமை)</option>
              <option value="Cotton">Cotton (பருத்தி)</option>
              <option value="Banana">Banana (வாழை)</option>
              <option value="Groundnut">Groundnut (நிலக்கடலை)</option>
              <option value="Maize">Maize (மக்காச்சோளம்)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Leaf Photograph
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '9px', border: '1px solid #dadce0', borderRadius: '4px', background: 'white' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={analyzingDisease}
          style={{
            padding: '14px',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          {analyzingDisease ? t.scanningBtn : t.scanBtn}
        </button>
      </form>

      {previewUrl && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dadce0' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#5f6368', textTransform: 'uppercase', fontWeight: '600' }}>Uploaded Leaf Preview:</p>
          <img
            src={previewUrl}
            alt="Leaf preview"
            style={{ maxHeight: '220px', borderRadius: '6px', border: '1px solid #dadce0', objectFit: 'contain' }}
          />
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf', marginTop: '20px' }}>
          {error}
        </div>
      )}

      {/* DIAGNOSTIC REPORT CARD */}
      {diseaseResult && (
        <div
          style={{
            marginTop: '32px',
            padding: '28px',
            background: diseaseResult.severity === 'None' ? '#e6f4ea' : '#fff8f7',
            borderRadius: '10px',
            border: diseaseResult.severity === 'None' ? '1px solid #ceead6' : '1px solid #f9dedc',
            borderLeft: diseaseResult.severity === 'None' ? '6px solid #137333' : '6px solid #c5221f',
            boxShadow: '0 1px 3px rgba(60,64,67,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: diseaseResult.severity === 'None' ? '#137333' : '#c5221f', letterSpacing: '0.5px' }}>
                Pathological Diagnosis
              </span>
              <h3 style={{ color: diseaseResult.severity === 'None' ? '#137333' : '#202124', margin: '4px 0 6px 0', fontSize: '24px', fontWeight: '600' }}>
                {diseaseResult.diseaseName}
              </h3>
              {diseaseResult.pathogen && (
                <p style={{ margin: 0, fontSize: '13px', color: '#5f6368' }}>
                  <strong>{t.pathogenTitle}:</strong> {diseaseResult.pathogen}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', background: '#fad2cf', color: '#b31412', padding: '4px 12px', borderRadius: '16px' }}>
                {diseaseResult.confidence} {t.match}
              </span>
              {diseaseResult.severity && diseaseResult.severity !== 'None' && (
                <span style={{ fontSize: '13px', fontWeight: '600', background: '#fce8e6', color: '#c5221f', padding: '4px 12px', borderRadius: '16px' }}>
                  Severity: {diseaseResult.severity}
                </span>
              )}
            </div>
          </div>

          {diseaseResult.symptoms && (
            <div style={{ margin: '16px 0', padding: '14px', background: 'white', borderRadius: '6px', border: '1px solid #dadce0' }}>
              <strong style={{ color: '#202124', display: 'block', fontSize: '13px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔍 {t.symptomsTitle}
              </strong>
              <p style={{ margin: 0, fontSize: '14px', color: '#3c4043', lineHeight: '1.5' }}>
                {diseaseResult.symptoms}
              </p>
            </div>
          )}

          {/* TWO COLUMN TREATMENTS: ORGANIC vs CHEMICAL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', margin: '20px 0' }}>
            <div style={{ padding: '16px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #188038', border: '1px solid #dadce0' }}>
              <strong style={{ color: '#137333', fontSize: '13px', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                🌱 {t.organicTitle}
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#3c4043', lineHeight: '1.5' }}>
                {diseaseResult.organicTreatment || diseaseResult.treatment}
              </p>
            </div>

            <div style={{ padding: '16px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #1a73e8', border: '1px solid #dadce0' }}>
              <strong style={{ color: '#174ea6', fontSize: '13px', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                🧪 {t.chemicalTitle}
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#3c4043', lineHeight: '1.5' }}>
                {diseaseResult.chemicalTreatment || diseaseResult.treatment}
              </p>
            </div>
          </div>

          {/* PREVENTATIVE CHECKLIST */}
          {diseaseResult.preventiveTips && diseaseResult.preventiveTips.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dadce0' }}>
              <strong style={{ color: '#202124', fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                🛡️ {t.preventionTitle}
              </strong>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#5f6368', lineHeight: '1.6' }}>
                {diseaseResult.preventiveTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
