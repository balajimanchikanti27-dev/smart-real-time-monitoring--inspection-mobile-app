import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function WelcomeAnimation() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'entering' | 'centered' | 'exiting'>('entering');

  useEffect(() => {
    // Stage 1: Man and text walk in (lasts ~1.5s)
    const timer1 = setTimeout(() => {
      setStage('centered');
    }, 1500);

    // Stage 2: Hold the composition, then exit at 3.5 seconds
    const timer2 = setTimeout(() => {
      setStage('exiting');
    }, 3500);

    // Stage 3: Navigate to login after exit animation
    const timer3 = setTimeout(() => {
      navigate('/login');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {stage !== 'exiting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] bg-slate-950 overflow-hidden flex items-center justify-center font-sans"
        >
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80" />

          {/* Core Animation Container */}
          <div className="relative w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-16 gap-8 overflow-hidden">
            
            {/* The Walking Man (Left Side) */}
            <motion.div
              initial={{ x: '-50vw', opacity: 0 }}
              animate={{ x: stage === 'entering' ? '-50vw' : '0vw', opacity: 1 }}
              transition={{
                x: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1 }
              }}
              className="relative z-20 h-[50vh] md:h-[85vh] w-full md:w-1/2 flex justify-center md:justify-start pointer-events-none order-2 md:order-1"
            >
              <img
                src="/inspector_walking.jpg"
                alt="Inspector"
                className="h-full w-auto object-contain drop-shadow-2xl brightness-110 contrast-125 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
                style={{ mixBlendMode: 'screen' }}
              />
            </motion.div>

            {/* The Text (Right Side) */}
            <motion.div
              initial={{ x: '-20vw', opacity: 0 }}
              animate={{ x: stage === 'entering' ? '-20vw' : '0vw', opacity: 1 }}
              transition={{
                x: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1, delay: 0.2 }
              }}
              className="relative z-30 w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left pointer-events-none order-1 md:order-2"
            >
              <h2 
                className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light text-slate-300 tracking-[0.2em] drop-shadow-lg mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Welcome to
              </h2>
              <h1 
                className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[7rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter drop-shadow-2xl whitespace-nowrap"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Smart Inspect
              </h1>
            </motion.div>

          </div>

          {/* Skip Intro Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-50 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/10 transition-all flex items-center gap-1"
          >
            Skip Intro <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
