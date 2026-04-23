import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TREASURE_HUNT_STEPS } from '../constants';
import { Printer, RefreshCw } from 'lucide-react';

export function MarkersDemo() {
  const [selected, setSelected] = useState<number>(0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      <div className="p-6 bg-white shadow-sm flex items-center justify-between">
         <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Demo Markers</h1>
         <Printer className="text-slate-400" />
      </div>
      
      <div className="max-w-md mx-auto w-full p-6 mt-4">
        <p className="text-slate-600 mb-6 text-center">
          For testing the web AR app, display these QR codes on another screen (like your computer) and scan them with your phone's camera!
        </p>
        
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {TREASURE_HUNT_STEPS.map((step, idx) => (
             <button
               key={step.id}
               onClick={() => setSelected(idx)}
               className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${selected === idx ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
             >
               Step {idx + 1}
             </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 flex flex-col items-center mt-4">
          <h2 className="text-xl font-bold mb-2 text-center">{TREASURE_HUNT_STEPS[selected].targetName}</h2>
          <p className="text-sm text-slate-500 mb-8 font-mono bg-slate-100 px-3 py-1 rounded-md">ID: {TREASURE_HUNT_STEPS[selected].id}</p>
          
          <div className="p-4 bg-white border-4 border-slate-800 rounded-2xl shadow-lg relative">
            <QRCodeSVG 
               value={TREASURE_HUNT_STEPS[selected].id} 
               size={240} 
               level="H"
               includeMargin={true}
            />
            
            {/* AR Target Decals */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-amber-500"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-amber-500"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-amber-500"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-amber-500"></div>
          </div>
          
          <p className="mt-8 text-center text-sm text-slate-500 max-w-[250px]">
            This acts as an AR Marker for Step {selected + 1}. Scan it from the app!
          </p>
        </div>
      </div>
    </div>
  );
}
