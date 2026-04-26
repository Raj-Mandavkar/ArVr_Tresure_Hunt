import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { HelpCircle, MapPin, Target, ChevronRight, Play, QrCode, Trophy, Eye } from 'lucide-react';
import { Scanner } from './components/Scanner';
import { MarkersDemo } from './components/MarkersDemo';
import { ARObjectOverlay } from './components/ARObjectOverlay';
import { TREASURE_HUNT_STEPS } from './constants';
import { playSuccessChime, playErrorSound, playClickSound } from './lib/audio';

type View = 'home' | 'playing' | 'completed' | 'markers';
type GameState = 'scanning' | 'found' | 'clue';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [stepIndex, setStepIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('scanning');
  const [showHelp, setShowHelp] = useState(false);
  const lastScannedRef = useRef<number>(0);

  const currentStep = TREASURE_HUNT_STEPS[stepIndex];
  
  // Confetti effect for completion
  useEffect(() => {
    if (view === 'completed') {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f59e0b', '#fbbf24', '#d97706']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#fbbf24', '#d97706']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      playSuccessChime(); // Make sure audio context is initiated by now
      frame();
    }
  }, [view]);

  const handleStart = () => {
    // Initiate audio context immediately on first explicit user gesture
    playClickSound();
    setStepIndex(0);
    setGameState('scanning');
    setView('playing');
  };

  const handleScan = (data: string) => {
    if (gameState !== 'scanning') return;
    
    const now = Date.now();
    // Debounce scans slightly
    if (now - lastScannedRef.current < 1500) return;
    lastScannedRef.current = now;

    if (data === currentStep.id) {
      playSuccessChime();
      setGameState('found');
    } else if (TREASURE_HUNT_STEPS.some(s => s.id === data)) {
      // Scanned a valid marker, but wrong sequence
      playErrorSound();
      alert("You found a marker, but it's not the right one for this clue! Keep looking.");
    }
  };

  const handleInteractWithObject = () => {
    playClickSound();
    setGameState('clue');
  };

  const handleNextClue = () => {
    playClickSound();
    if (stepIndex === TREASURE_HUNT_STEPS.length - 1) {
      setView('completed');
    } else {
      setStepIndex(stepIndex + 1);
      setGameState('scanning');
    }
  };

  if (view === 'markers') return <MarkersDemo />;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* HOME VIEW */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center p-8 max-w-md w-full relative z-10"
          >
             {/* Animated icon container */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="w-28 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.6)] flex items-center justify-center mb-10 relative overflow-hidden"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <MapPin className="w-14 h-14 text-white drop-shadow-lg relative z-10" />
             </motion.div>
             
             <h1 className="text-5xl font-black text-center bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
               AR Treasure Hunt
             </h1>
             <p className="text-slate-300 text-base text-center mb-3 leading-relaxed font-medium">
               Discover hidden treasures in your world through cutting-edge augmented reality
             </p>
             <p className="text-slate-400 text-xs text-center mb-12 leading-relaxed">
               Scan markers, solve puzzles, and complete your quest. An immersive adventure awaits!
             </p>
             
             <div className="space-y-3 w-full">
               <button 
                 onClick={handleStart}
                 className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-4 px-8 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(34,211,238,0.4)] transition-all hover:shadow-[0_15px_40px_rgba(34,211,238,0.6)] active:scale-95 transform hover:scale-105"
               >
                 <Play className="w-5 h-5 fill-current" /> Start Adventure
               </button>
               
               <button 
                 onClick={() => setView('markers')}
                 className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-bold text-sm uppercase tracking-widest py-4 px-8 rounded-2xl transition-all active:scale-95 hover:bg-white/20 hover:border-white/40"
               >
                 <QrCode className="w-5 h-5" /> View Markers
               </button>
             </div>
          </motion.div>
        )}

        {/* PLAYING VIEW */}
        {view === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
             {/* THE CAMERA LAYER */}
             <div className="absolute inset-0 bg-black">
               <Scanner 
                 isActive={gameState === 'scanning'} 
                 onScan={handleScan}
                 className="rounded-none border-none shadow-none" 
               />
             </div>
             
             {/* TOP HUD */}
             <div className="absolute top-0 left-0 right-0 p-6 pt-safe z-40 flex justify-between items-center pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 bg-black/50 backdrop-blur-xl rounded-full px-4 py-2 border border-cyan-500/30 pointer-events-auto"
                >
                   <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)] animate-pulse"></div>
                   <span className="text-xs font-bold uppercase tracking-wider text-white">
                     Phase {String(stepIndex + 1).padStart(2, '0')} / {String(TREASURE_HUNT_STEPS.length).padStart(2, '0')}
                   </span>
                </motion.div>
                
                <motion.button 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => { playClickSound(); setShowHelp(true); }}
                  className="w-11 h-11 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 backdrop-blur-lg rounded-full flex items-center justify-center border border-cyan-400/40 hover:border-cyan-400/80 transition-all pointer-events-auto shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                >
                  <HelpCircle className="w-5 h-5 text-cyan-300" />
                </motion.button>
             </div>
             
             {/* OBJECTIVE HUD */}
             <div className="absolute top-20 left-0 right-0 px-6 z-40 pointer-events-none">
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 shadow-2xl pointer-events-auto"
               >
                 <div className="flex items-center space-x-3 mb-4">
                   <div className="p-2.5 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-xl text-cyan-300 border border-cyan-500/40">
                     <Target className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-bold tracking-tight text-white mb-0">Current Objective</h3>
                 </div>
                 <p className="text-slate-200 text-sm leading-relaxed mb-5 font-medium">
                   {gameState === 'scanning' ? currentStep.clueToFindThis : 'Target found! Tap the object to interact.'}
                 </p>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     layoutId="progress"
                     className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                     style={{ width: `${((stepIndex + (gameState === 'scanning' ? 0 : 0.5)) / TREASURE_HUNT_STEPS.length) * 100}%` }}
                     transition={{ duration: 0.5 }}
                   />
                 </div>
               </motion.div>
             </div>
             
             {/* AR OVERLAY LAYER (Appears when marker found) */}
             {gameState === 'found' && (
               <ARObjectOverlay type={currentStep.arObject} onInteract={handleInteractWithObject} />
             )}

             {/* CLUE MODAL */}
             <AnimatePresence>
                {gameState === 'clue' && (
                  <motion.div 
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/90 to-black/80 backdrop-blur-3xl rounded-t-[48px] border-t border-cyan-500/30 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] p-8 max-h-[80vh] overflow-y-auto"
                  >
                     <motion.div 
                       animate={{ y: [0, -8, 0] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="w-16 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mb-8" 
                     />
                     
                     <div className="text-center mb-8">
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: "spring", damping: 20 }}
                         className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-cyan-300 mb-4 border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                       >
                         <Target className="w-10 h-10" />
                       </motion.div>
                       <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Treasure Acquired!</h2>
                       <p className="text-slate-300 text-base">
                         {currentStep.successMessage}
                       </p>
                     </div>
                     
                     {stepIndex < TREASURE_HUNT_STEPS.length - 1 && (
                       <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md p-6 rounded-3xl mb-8 border border-cyan-500/20 shadow-inner">
                          <p className="text-xs text-cyan-300 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Eye className="w-4 h-4"/> Next Clue</p>
                          <p className="text-sm text-slate-200 leading-relaxed font-medium">{TREASURE_HUNT_STEPS[stepIndex + 1].clueToFindThis}</p>
                       </div>
                     )}
                     
                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={handleNextClue}
                       className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_35px_rgba(34,211,238,0.7)]"
                     >
                       {stepIndex === TREASURE_HUNT_STEPS.length - 1 ? 'Reveal Final Treasure' : 'Continue Hunt'}
                       <ChevronRight className="w-4 h-4" />
                     </motion.button>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}

        {/* COMPLETED VIEW */}
        {view === 'completed' && (
          <motion.div 
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center w-full max-w-sm p-8 text-center relative z-10"
          >
             <div className="relative mb-10">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-3xl opacity-50 rounded-full"
               />
               <motion.div
                 animate={{ y: [0, -30, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <Trophy className="w-48 h-48 text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] relative z-10" />
               </motion.div>
             </div>
             
             <motion.h1 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400"
             >
               🎉 Treasure Found! 🎉
             </motion.h1>
             
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="text-slate-200 text-lg mb-12 leading-relaxed font-medium"
             >
               Congratulations! You've successfully completed the AR Treasure Hunt with exceptional skill and precision!
             </motion.p>
             
             <motion.button 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => { playClickSound(); setView('home'); }}
               className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold py-4 px-8 rounded-2xl text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(251,191,36,0.4)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.6)]"
             >
               Play Again
             </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* HELP OVERLAY */}
      <AnimatePresence>
        {showHelp && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
           >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-black/90 to-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(34,211,238,0.3)]"
              >
                 <h3 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">How to Play</h3>
                 
                 <ul className="space-y-6 mb-8">
                   <motion.li 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.1 }}
                     className="flex gap-4 items-start"
                   >
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">01</div>
                     <div>
                       <p className="text-slate-200 text-sm font-semibold mb-1">Read Your Objective</p>
                       <p className="text-slate-400 text-xs">See the current objective at the top of your screen and understand what you're looking for.</p>
                     </div>
                   </motion.li>
                   
                   <motion.li 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                     className="flex gap-4 items-start"
                   >
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">02</div>
                     <div>
                       <p className="text-slate-200 text-sm font-semibold mb-1">Scan the Marker</p>
                       <p className="text-slate-400 text-xs">Point your camera at the QR code marker that corresponds to the clue you received.</p>
                     </div>
                   </motion.li>
                   
                   <motion.li 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 }}
                     className="flex gap-4 items-start"
                   >
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">03</div>
                     <div>
                       <p className="text-slate-200 text-sm font-semibold mb-1">Interact & Collect</p>
                       <p className="text-slate-400 text-xs">Tap the virtual object that appears to collect your item and receive the next clue!</p>
                     </div>
                   </motion.li>
                   
                   <motion.li 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     className="flex gap-4 items-start"
                   >
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">04</div>
                     <div>
                       <p className="text-slate-200 text-sm font-semibold mb-1">Complete the Quest</p>
                       <p className="text-slate-400 text-xs">Follow the sequence until you discover the final treasure and complete your adventure!</p>
                     </div>
                   </motion.li>
                 </ul>
                 
                 <motion.button 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => { playClickSound(); setShowHelp(false); }}
                   className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-4 rounded-2xl transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                 >
                   Ready to Play!
                 </motion.button>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
