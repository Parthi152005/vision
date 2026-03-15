import { useState } from 'react';
import axios from 'axios';
import CameraCapture from '../components/CameraCapture';
import { Plant, UploadSimple, X, Sparkle, WarningCircle, CheckCircle, Globe, Camera } from '@phosphor-icons/react';

const CropRecommendation = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
            setShowCamera(false);
        }
    };

    const handleCameraCapture = (file) => {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setShowCamera(false);
        setResult(null);
        setError(null);
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Note: Update Base URL if Flask is not on localhost:5000
            const response = await axios.post('http://localhost:5000/api/predict_crop', formData);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><Plant size={32} className="text-green" weight="fill" /> Crop Recommender</h2>
                <p>Upload a picture of your soil to use AI for soil classification and crop recommendations.</p>
            </div>

            <div className="form-container glass-panel animate-slide-up">
                <div className="flex justify-center gap-4 mb-8" style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem'}}>
                    <button 
                        type="button"
                        onClick={() => { setShowCamera(false); removeImage(); }}
                        className={!showCamera ? 'btn-primary' : 'btn-primary'}
                        style={{
                            backgroundColor: !showCamera ? '#10b981' : '#9ca3af',
                            opacity: !showCamera ? 1 : 0.7
                        }}
                    >
                        <UploadSimple weight="bold" /> Upload File
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setShowCamera(true); removeImage(); }}
                        className={showCamera ? 'btn-primary' : 'btn-primary'}
                        style={{
                            backgroundColor: showCamera ? '#10b981' : '#9ca3af',
                            opacity: showCamera ? 1 : 0.7
                        }}
                    >
                        <Camera weight="bold" /> Take Photo
                    </button>
                </div>

                <form onSubmit={handleUpload}>
                    {showCamera ? (
                        <div className="mb-6">
                            <CameraCapture 
                                onCapture={handleCameraCapture} 
                                onClose={() => setShowCamera(false)} 
                            />
                        </div>
                    ) : (
                        <div 
                            className={`upload-zone mb-6 ${preview ? 'has-preview' : ''}`}
                            onClick={() => !preview && document.getElementById('soil-upload').click()}
                            style={{
                                border: '2px dashed #d1d5db',
                                borderRadius: '16px',
                                minHeight: '240px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                cursor: preview ? 'default' : 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {preview ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={preview} alt="Soil Preview" style={{maxHeight: '300px', borderRadius: '12px', marginBottom: '1rem'}} />
                                    <button 
                                        type="button" 
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X size={20} weight="bold" />
                                    </button>
                                    <p className="text-sm font-semibold text-gray-500">{selectedFile.name}</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-500 inline-block mb-4">
                                        <UploadSimple size={48} weight="duotone" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">Click to upload soil image</h3>
                                    <p className="text-sm text-gray-400">Supports: JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                id="soil-upload" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={!selectedFile || loading}
                        >
                            {loading ? (
                                <>Scanning via AI...</>
                            ) : (
                                <>
                                    Analyze Soil <Sparkle size={20} weight="fill" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Message for Unwanted Pictures */}
            {error && (
                <div className="mt-8 p-6 glass-panel border-red-200 animate-slide-up bg-red-50" style={{backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2'}}>
                    <div className="flex items-center gap-4 text-red-600">
                        <div className="p-3 bg-red-100 rounded-full">
                            <WarningCircle size={32} weight="fill" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Invalid Image</h3>
                            <p className="text-red-500">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Result */}
            {result && (
                <div className="mt-8 glass-panel overflow-hidden animate-slide-up">
                    <div className="p-8 flex items-center gap-6" style={{background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)'}}>
                        <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm">
                            <Globe size={40} weight="duotone" />
                        </div>
                        <div>
                            <span className="text-emerald-700 font-bold uppercase text-xs tracking-widest">Detected Soil Type</span>
                            <h2 className="text-3xl font-black text-emerald-900 leading-tight">{result.soil_type}</h2>
                        </div>
                    </div>
                    <div className="p-10">
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <CheckCircle size={18} className="text-emerald-500" /> Recommended Crops
                            </h4>
                            <p className="text-xl font-bold text-gray-800">{result.recommended_crops}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Farming Suggestion</h4>
                            <p className="text-gray-600 leading-relaxed italic border-l-4 border-emerald-300 pl-4">
                                "{result.suggestion}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropRecommendation;
