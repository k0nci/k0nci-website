import React from 'react';

interface HeroTitleProps {
  name: string;
  subtitle: string;
  className?: string;
}

const HeroTitle: React.FC<HeroTitleProps> = ({ name, subtitle, className = '' }) => (
  <div className={className}>
    <h1 className="bg-gradient-to-b from-white to-gray-300 bg-clip-text pb-4 text-6xl font-thin tracking-widest text-transparent drop-shadow-2xl md:text-7xl">
      {name}
    </h1>
    <p className="text-xl font-light opacity-90 drop-shadow-lg md:text-2xl">{subtitle}</p>
  </div>
);

export default HeroTitle;
