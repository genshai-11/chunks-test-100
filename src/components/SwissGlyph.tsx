import React from 'react';

interface SwissGlyphProps {
  isOpen: boolean;
}

export const SwissGlyph: React.FC<SwissGlyphProps> = ({ isOpen }) => {
  return (
    <div
      className="w-[22px] h-[22px] relative shrink-0 ml-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Horizontal Bar (22px x 1.5px) */}
      <span
        style={{
          transition: 'background-color 200ms ease',
        }}
        className={`absolute top-1/2 left-0 -translate-y-1/2 w-[22px] h-[1.5px] ${
          isOpen ? 'bg-[#c81e16]' : 'bg-[#0a0a0a] group-hover:bg-[#c81e16]'
        }`}
      />

      {/* Vertical Bar (1.5px x 22px) - Scales to 0 on open over 360ms cubic-bezier */}
      <span
        style={{
          transformOrigin: 'center',
          transform: isOpen ? 'scaleY(0)' : 'scaleY(1)',
          opacity: isOpen ? 0 : 1,
          transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease, background-color 200ms ease',
        }}
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[22px] ${
          isOpen ? 'bg-[#c81e16]' : 'bg-[#0a0a0a] group-hover:bg-[#c81e16]'
        }`}
      />
    </div>
  );
};
