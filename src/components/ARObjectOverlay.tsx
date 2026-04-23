import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Key, ArchiveX, Sparkles } from 'lucide-react';

interface ArObjectOverlayProps {
  type: 'map' | 'key' | 'chest';
  onInteract: () => void;
}

export function ARObjectOverlay({ type, onInteract }: ArObjectOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-blue-900/40 via-transparent to-black/60"
        onClick={onInteract}
      >
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
            <div className="w-32 h-32 rounded-full border-2 border-cyan-400/50 flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
            </div>
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative top-[10%] group cursor-pointer"
        >
           <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 transition-transform group-hover:scale-105 active:scale-95">
              <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl transform rotate-12 flex items-center justify-center shadow-lg">
                {type === 'map' && <Map className="w-10 h-10 text-white -rotate-12" />}
                {type === 'key' && <Key className="w-10 h-10 text-white -rotate-12" />}
                {type === 'chest' && <ArchiveX className="w-10 h-10 text-white -rotate-12" />}
              </div>
              
              <div className="text-center mt-2">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1 shadow-sm">Marker Detected</p>
                <p className="text-lg text-white font-medium">{type === 'chest' ? 'Open Chest!' : 'Collect Item'}</p>
                <p className="text-xs text-slate-300 mt-2 flex items-center justify-center gap-1"><Sparkles className="w-3 h-3"/> Tap to interact</p>
              </div>
           </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
