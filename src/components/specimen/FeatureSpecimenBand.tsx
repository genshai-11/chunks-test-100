import React from 'react';

export const FeatureSpecimenBand: React.FC = () => {
  return (
    <section className="w-full bg-[#0a0a0a] text-white border-b border-[rgba(10,10,10,0.14)]" aria-label="Feature Specimen Rule">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-[11.5px] font-medium uppercase tracking-[0.22em] text-white/90">
          {/* Cell 1: Prompt to UI */}
          <div className="py-3.5 px-4 border-r border-white/15 flex items-center justify-start truncate">
            <span>Prompt to UI</span>
          </div>

          {/* Cell 2: Infinite canvas */}
          <div className="py-3.5 px-4 border-r-0 sm:border-r border-white/15 flex items-center justify-start truncate">
            <span>Infinite canvas</span>
          </div>

          {/* Cell 3: Component library (hidden below sm) */}
          <div className="hidden sm:flex py-3.5 px-4 border-r-0 lg:border-r border-white/15 items-center justify-start truncate">
            <span>Component library</span>
          </div>

          {/* Cell 4: Coding-agent skill */}
          <div className="py-3.5 px-4 border-r border-white/15 flex items-center justify-start truncate">
            <span>Coding-agent skill</span>
          </div>

          {/* Cell 5: Ship faster (hidden below lg) */}
          <div className="hidden lg:flex py-3.5 px-4 items-center justify-start truncate">
            <span>Ship faster</span>
          </div>
        </div>
      </div>
    </section>
  );
};
