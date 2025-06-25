import React from 'react';

interface MountainLayerProps {
  className?: string;
}

const MountainLayers: React.FC<MountainLayerProps> = ({ className = '' }) => {
  const mountains = [
    {
      name: 'mountain-back',
      gradient: 'bg-linear-to-t from-black/40 to-transparent',
      clipPath:
        'polygon(0% 100%, 10% 70%, 25% 85%, 40% 55%, 55% 75%, 70% 45%, 85% 65%, 100% 50%, 100% 100%)',
    },
    {
      name: 'mountain-mid',
      gradient: 'bg-linear-to-t from-black/60 to-transparent',
      clipPath:
        'polygon(0% 100%, 20% 80%, 35% 65%, 50% 85%, 65% 60%, 80% 75%, 100% 65%, 100% 100%)',
    },
    {
      name: 'mountain-front',
      gradient: 'bg-linear-to-t from-black/80 to-transparent',
      clipPath:
        'polygon(0% 100%, 15% 90%, 30% 75%, 45% 95%, 60% 70%, 75% 85%, 90% 75%, 100% 90%, 100% 100%)',
    },
  ];

  return (
    <div className={`${className} absolute bottom-0 left-0 h-1/2 w-full`}>
      {mountains.map((mountain) => (
        <div
          key={mountain.name}
          className={`absolute bottom-0 left-0 h-full w-full ${mountain.gradient}`}
          style={{ clipPath: mountain.clipPath }}
        />
      ))}
    </div>
  );
};

export default MountainLayers;
