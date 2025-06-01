import React from 'react';

const AuroraBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Main aurora layer */}
    <div
      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/30 to-green-400/20 opacity-60"
      style={{
        animation: 'auroraShift 24s ease-in-out infinite',
        filter: 'blur(60px)',
        transform: 'scale(1.5)',
      }}
    />

    {/* Secondary aurora layer */}
    <div
      className="absolute inset-0 bg-gradient-to-l from-pink-400/15 via-purple-600/25 to-blue-400/15 opacity-70"
      style={{
        animation: 'auroraShift 32s ease-in-out infinite reverse',
        filter: 'blur(80px)',
        transform: 'scale(1.2)',
        animationDelay: '2s',
      }}
    />

    {/* Third aurora layer for more complexity */}
    <div
      className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-indigo-500/20 to-purple-500/10 opacity-50"
      style={{
        animation: 'auroraShift 64s ease-in-out infinite',
        filter: 'blur(100px)',
        transform: 'scale(1.8)',
        animationDelay: '4s',
      }}
    />
  </div>
);

export default AuroraBackground;
