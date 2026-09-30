import React from 'react';

export const ChunksFeatureBand: React.FC = () => {
  return (
    <section className="w-full bg-[#0a0a0a] text-white hairline-b" aria-label="CHUNKS Specimen Feature Rule">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-[11.5px] font-medium uppercase tracking-[0.22em] text-white/90">
          {/* Cell 1: CHUNKS THEORY */}
          <div className="py-3.5 px-4 border-r border-white/15 flex items-center justify-start truncate">
            <span>CHUNKS THEORY</span>
          </div>

          {/* Cell 2: 1-ON-1 CIC */}
          <div className="py-3.5 px-4 border-r-0 sm:border-r border-white/15 flex items-center justify-start truncate">
            <span>1-ON-1 CIC TEST</span>
          </div>

          {/* Cell 3: MOTION SOUND EMOTION (hidden below sm) */}
          <div className="hidden sm:flex py-3.5 px-4 border-r-0 lg:border-r border-white/15 items-center justify-start truncate">
            <span>MSE RESONANCE</span>
          </div>

          {/* Cell 4: MINI-TEST 21 CÂU */}
          <div className="py-3.5 px-4 border-r border-white/15 flex items-center justify-start truncate">
            <span>21 CHALLENGES (MINI-TEST)</span>
          </div>

          {/* Cell 5: Pilot registration target (hidden below lg) */}
          <div className="hidden lg:flex py-3.5 px-4 items-center justify-start truncate">
            <span>100-REGISTRATION TARGET</span>
          </div>
        </div>
      </div>
    </section>
  );
};
