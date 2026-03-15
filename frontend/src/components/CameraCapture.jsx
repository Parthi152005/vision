import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Stop, ArrowsClockwise, CameraSlash } from '@phosphor-icons/react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);


  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  }, [stream]); // Add stream as dependency since it's used inside toggle logic if any, but actually it's fine. 
  // Wait, if I use functional update for setStream it might be better. 
  // Actually startCamera doesn't use stream except to set it. So [] is fine.

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        onCapture(file);
      }, 'image/jpeg');
    }
  };

  return (
    <div className="camera-overlay glass-panel animate-fade-in" style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '24px',
      background: '#000',
      aspectRatio: '4/3',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
          <CameraSlash size={48} weight="duotone" className="text-red-500 mb-4" />
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-700 rounded-full">Close</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6" style={{
            position: 'absolute', bottom: '1.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1.5rem', zIndex: 20
          }}>
            <button 
              type="button"
              onClick={onClose} 
              className="glass-panel"
              style={{
                width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
              title="Close Camera"
            >
              <Stop size={24} weight="fill" />
            </button>
            <button 
              type="button"
              onClick={captureFrame} 
              style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', color: '#fff', border: '6px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', scale: '1.1'
              }}
              title="Capture Image"
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Camera size={36} weight="fill" />
            </button>
            <button 
              type="button"
              onClick={startCamera} 
              className="glass-panel"
              style={{
                width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
              title="Reload Camera"
            >
              <ArrowsClockwise size={24} weight="bold" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
