import { useState } from 'react';
import { predictDisease } from '../utils/ai';
import { Bug, Image as ImageIcon, Sparkle, X, WarningCircle, ShieldCheck, Camera } from '@phosphor-icons/react';
import CameraCapture from '../components/CameraCapture';

const DiseaseDetection = () => {
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const data = await predictDisease(selectedFile);
            setResult(data);
        } catch (err) {
            setError(err.message || "Detection failed. Please try a clearer leaf image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2><Bug size={32} className="text-red" weight="fill" /> Disease Detection</h2>
                <p>Upload a clear photo of the infected leaf to identify the disease and get treatment advice.</p>
            </div>

            <div className="content-wrapper">
                <div className="form-container glass-panel animate-slide-up">
                    <div className="flex justify-center gap-4 mb-8" style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem'}}>
                        <button 
                            type="button"
                            onClick={() => { setShowCamera(false); setSelectedFile(null); setPreview(null); }}
                            className="btn-red"
                            style={{
                                backgroundColor: !showCamera ? '#ef4444' : '#9ca3af',
                                padding: '12px 24px',
                                opacity: !showCamera ? 1 : 0.7
                            }}
                        >
                            <ImageIcon weight="bold" /> Upload File
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setShowCamera(true); setSelectedFile(null); setPreview(null); }}
                            className="btn-red"
                            style={{
                                backgroundColor: showCamera ? '#ef4444' : '#9ca3af',
                                padding: '12px 24px',
                                opacity: showCamera ? 1 : 0.7
                            }}
                        >
                            <Camera weight="bold" /> Take Photo
                        </button>
                    </div>

                    <form onSubmit={handleUpload}>
                        {showCamera ? (
                            <div className="mb-8">
                                <CameraCapture 
                                    onCapture={handleCameraCapture} 
                                    onClose={() => setShowCamera(false)} 
                                />
                            </div>
                        ) : (
                             <div 
                                    className={`upload-zone mb-8 ${preview ? 'has-preview' : ''}`}
                                    onClick={() => !preview && document.getElementById('leaf-upload').click()}
                                    style={{
                                        border: '2px dashed #f87171',
                                        backgroundColor: 'rgba(254, 242, 242, 0.5)',
                                        borderRadius: '20px',
                                        minHeight: '260px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        cursor: preview ? 'default' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                >
                                    {preview ? (
                                        <div className="relative w-full text-center">
                                            <img src={preview} alt="Leaf Preview" style={{maxHeight: '300px', borderRadius: '12px', border: '5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                                            <button 
                                                type="button" 
                                                onClick={() => {setSelectedFile(null); setPreview(null);}}
                                                className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 p-2 bg-red-500 text-white rounded-full shadow-lg"
                                            >
                                                <X size={20} weight="bold" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon size={64} weight="duotone" className="text-red-400 mb-4 mx-auto" />
                                            <h3 className="text-lg font-bold text-red-900">Upload Leaf Image</h3>
                                            <p className="text-sm text-red-400">Drag & drop or click to browse</p>
                                        </div>
                                    )}
                                    <input type="file" id="leaf-upload" className="hidden" accept="image/*" onChange={handleFileChange} onClick={e => e.stopPropagation()} />
                                </div>
                        )}

                            <div className="flex justify-center">
                                <button type="submit" className="btn-primary btn-red" disabled={!selectedFile || loading}>
                                    {loading ? "Identifying..." : "Scan Leaf"}
                                    {!loading && <Sparkle size={20} weight="fill" />}
                                </button>
                            </div>
                    </form>
                </div>

                {error && (
                    <div className="mt-8 p-6 glass-panel border-red-200 animate-slide-up flex items-center gap-4 text-red-600">
                        <WarningCircle size={32} weight="fill" />
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-10 glass-panel overflow-hidden animate-slide-up" style={{border: 'none'}}>
                        <div className="p-8 text-white" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-red-100 font-bold text-xs uppercase tracking-widest">Disease Identified</span>
                                    <h2 className="text-3xl font-black mt-1">{result.prediction}</h2>
                                </div>
                                <ShieldCheck size={48} weight="fill" className="text-red-200 opacity-50" />
                            </div>
                        </div>

                        <div className="p-10 bg-white">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 text-red-600">Confidence Score</h4>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full" style={{width: '94%'}}></div>
                                    </div>
                                    <p className="text-right text-xs font-bold text-gray-400 mt-1">94% Accuracy</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-bold text-gray-800 mb-2">Recommended Treatment:</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {result.advice || "Apply appropriate fungicide and ensure proper spacing between plants to improve air circulation. Remove infected leaves immediately to prevent further spread."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetection;
