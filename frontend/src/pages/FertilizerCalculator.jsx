import { useState } from 'react';
import axios from 'axios';
import { Flask, CaretRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';

const FertilizerCalculator = () => {
    const [formData, setFormData] = useState({
        n: '', p: '', k: '', ph: '', crop: 'Rice'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const crops = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await axios.post(`${baseUrl}/api/predict_fertilizer`, formData);
            setResult(response.data.prediction);
        } catch {
            setError("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><Flask size={32} className="text-blue" weight="fill" /> Fertilizer Calculator</h2>
                <p>Enter your soil nutrients and crop type to get the best fertilizer recommendation.</p>
            </div>

            <div className="form-container glass-panel animate-slide-up">
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Nitrogen (N)</label>
                        <input type="number" name="n" value={formData.n} onChange={handleChange} placeholder="e.g. 50" required />
                    </div>
                    <div className="form-group">
                        <label>Phosphorous (P)</label>
                        <input type="number" name="p" value={formData.p} onChange={handleChange} placeholder="e.g. 40" required />
                    </div>
                    <div className="form-group">
                        <label>Potassium (K)</label>
                        <input type="number" name="k" value={formData.k} onChange={handleChange} placeholder="e.g. 40" required />
                    </div>
                    <div className="form-group">
                        <label>Soil pH</label>
                        <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g. 6.5" required />
                    </div>
                    <div className="form-group full-width">
                        <label>Select Your Crop</label>
                        <select name="crop" value={formData.crop} onChange={handleChange}>
                            {crops.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="full-width flex justify-center mt-6">
                        <button type="submit" className="btn-primary btn-blue" disabled={loading}>
                            {loading ? "Calculating..." : "Get Recommendation"}
                            {!loading && <CaretRight size={20} weight="bold" />}
                        </button>
                    </div>
                </form>
            </div>

            {result && (
                <div className="mt-8 p-10 glass-panel animate-slide-up bg-blue-50" style={{borderLeft: '8px solid var(--primary-blue)'}}>
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                             <CheckCircle size={40} weight="fill" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Recommended Fertilizer</h3>
                            <h2 className="text-3xl font-black text-blue-900">{result}</h2>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-8 p-6 glass-panel border-red-200 animate-slide-up">
                    <div className="flex items-center gap-4 text-red-600">
                        <WarningCircle size={24} weight="fill" />
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FertilizerCalculator;
