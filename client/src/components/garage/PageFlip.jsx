import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Realistic Physical Book Page-Turn Variants
 * Simulates a heavy collector album leaf turning around the central binding spine.
 */
const bookPageVariants = {
  enter: (direction) => ({
    rotateY: direction > 0 ? 55 : -55,
    x: direction > 0 ? '6%' : '-6%',
    scale: 0.97,
    opacity: 0,
    filter: 'brightness(0.7) contrast(1.1)',
    boxShadow: direction > 0
      ? '-20px 25px 50px rgba(0, 0, 0, 0.9)'
      : '20px 25px 50px rgba(0, 0, 0, 0.9)',
    transition: {
      duration: 0.42,
      ease: [0.25, 1, 0.35, 1],
    },
  }),
  center: {
    rotateY: 0,
    x: '0%',
    scale: 1,
    opacity: 1,
    filter: 'brightness(1) contrast(1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    rotateY: direction > 0 ? -60 : 60,
    x: direction > 0 ? '-6%' : '6%',
    scale: 0.97,
    opacity: 0,
    filter: 'brightness(0.6) contrast(1.15)',
    boxShadow: direction > 0
      ? '25px 30px 60px rgba(0, 0, 0, 0.95)'
      : '-25px 30px 60px rgba(0, 0, 0, 0.95)',
    transition: {
      duration: 0.38,
      ease: [0.36, 0, 0.66, -0.05],
    },
  }),
};

export default function PageFlip({ 
  pageKey, 
  direction = 0, 
  children
}) {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ perspective: '2600px' }}
    >
      {/* Underlying Physical Book Hardcover Base (Stays anchored while leaves turn) */}
      <div className="absolute inset-0 -m-1 sm:-m-2 rounded-3xl bg-[#090b0e] border-2 border-zinc-800 shadow-[0_30px_70px_rgba(0,0,0,0.95)] pointer-events-none z-0">
        {/* Book Edge Pages Rim (Stacked paper illusion on left and right borders) */}
        <div className="absolute top-2 bottom-2 left-0 w-2 bg-gradient-to-r from-zinc-700/40 via-zinc-800/20 to-transparent rounded-l-md" />
        <div className="absolute top-2 bottom-2 right-0 w-2 bg-gradient-to-l from-zinc-700/40 via-zinc-800/20 to-transparent rounded-r-md" />
        {/* Bottom Page Rim */}
        <div className="absolute bottom-0 left-4 right-4 h-1.5 bg-gradient-to-t from-zinc-800/60 to-transparent" />
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={pageKey}
          custom={direction}
          variants={bookPageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            transformOrigin: direction >= 0 ? 'center left' : 'center right',
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 w-full h-full rounded-2xl bg-zinc-950 border-2 border-zinc-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between"
        >
          {/* 3D Central Book Spine Crease & Shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/70 via-black/30 to-black/70 z-30 pointer-events-none hidden md:block" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-zinc-700/70 z-30 pointer-events-none hidden md:block" />

          {/* Dynamic Paper Curl Specular Highlight (sweeps as page lands) */}
          <motion.div
            initial={{ opacity: 0.4, x: direction >= 0 ? '-40%' : '40%' }}
            animate={{ opacity: 0, x: direction >= 0 ? '60%' : '-60%' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-25"
          />

          {/* Page Content */}
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
