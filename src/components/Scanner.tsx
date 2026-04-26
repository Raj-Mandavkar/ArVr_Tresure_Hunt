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
    <div className={cn("relative overflow-hidden w-full h-full bg-black rounded-none border-none shadow-none flex items-center justify-center", className)}>
      {cameraError ? (
        <div className="text-center p-6 text-red-300 bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/40">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-70" />
          <p className="font-semibold">{cameraError}</p>
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
          
          {/* Gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
          
          {/* Target Reticle Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
             {/* Main scanning frame */}
             <div className="w-72 h-72 border border-cyan-400/40 rounded-[50px] relative shadow-[0_0_30px_rgba(34,211,238,0.3)]">
               {/* Corner markers */}
               <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-400 rounded-tl-[20px] shadow-lg"></div>
               <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-400 rounded-tr-[20px] shadow-lg"></div>
               <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-400 rounded-bl-[20px] shadow-lg"></div>
               <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-400 rounded-br-[20px] shadow-lg"></div>
               
               {/* Scanning line animation */}
               {isActive && (
                 <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
               )}
               
               {/* Center focus point */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse" />
             </div>
             
             {isActive && (
               <div className="mt-10 text-cyan-300 font-bold text-sm tracking-widest bg-black/60 px-6 py-2 rounded-full backdrop-blur-lg shadow-lg border border-cyan-400/30 flex items-center gap-2">
                 <RefreshCw className="w-4 h-4 animate-spin"/> SCANNING MARKER
               </div>
             )}
          </div>
        </>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
