import React from 'react';

const TwinklingStars: React.FC = () => {
  const stars = [
    { size: 'w-0.5 h-0.5', top: '20%', left: '20%', delay: '0s' },
    { size: 'w-1 h-1', top: '15%', left: '80%', delay: '1s' },
    { size: 'w-0.5 h-0.5', top: '22%', left: '60%', delay: '2s' },
    { size: 'w-px h-px', top: '10%', left: '40%', delay: '0.5s' },
    { size: 'w-0.5 h-0.5', top: '25%', left: '90%', delay: '1.5s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, index) => (
        <div
          // eslint-disable-next-line react-x/no-array-index-key
          key={`star-${index}`}
          className={`absolute ${star.size} rounded-full bg-white/80`}
          style={{
            top: star.top,
            left: star.left,
            animationName: 'twinkle',
            animationDelay: star.delay,
            animationDuration: '3s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
};

export default TwinklingStars;
