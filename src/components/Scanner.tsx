import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Camera, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
  className?: string;
}

export function Scanner({ onScan, isActive, className }: ScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const tick = useCallback(() => {
    if (!isActive) return;

    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === webcamRef.current.video.HAVE_ENOUGH_DATA
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            onScan(code.data);
          }
        }
      }
    }
    
    // Request next frame
    requestAnimationFrame(tick);
  }, [isActive, onScan]);

  useEffect(() => {
    let animationFrameId: number;
    if (isActive) {
      animationFrameId = requestAnimationFrame(tick);
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, tick]);

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Camera access error:", error);
    setCameraError("Camera permission denied or camera not found. Please enable camera access to play.");
  };

  return (
    <div className={cn("relative overflow-hidden w-full h-full bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-2xl flex items-center justify-center", className)}>
      {cameraError ? (
        <div className="text-center p-6 text-red-400">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{cameraError}</p>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{ facingMode: "environment" }}
            onUserMediaError={handleUserMediaError}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Target Reticle Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-64 h-64 border-2 border-white/50 rounded-[40px] relative">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-[40px]"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-[40px]"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-[40px]"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-[40px]"></div>
               
               {/* Scanning line animation */}
               <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/80 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)] animate-[scan_2s_ease-in-out_infinite]" />
             </div>
             {isActive && <div className="mt-6 text-white/80 font-mono text-sm tracking-widest bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm shadow flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/> SCANNING MARKER</div>}
          </div>
        </>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
