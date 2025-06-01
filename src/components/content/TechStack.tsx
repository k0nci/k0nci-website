import React from 'react';

interface TechStackProps {
  technologies: string[];
  className?: string;
}

const TechStack: React.FC<TechStackProps> = ({ technologies, className = '' }) => (
  <div className={`${className} flex flex-wrap justify-center gap-4 md:gap-10`}>
    {technologies.map((tech) => (
      <div
        key={tech}
        className="rounded-full border border-white/15 bg-white/8 px-6 py-3 backdrop-blur-xl md:px-9 md:py-5"
      >
        <span className="text-sm font-light tracking-wide md:text-base">{tech}</span>
      </div>
    ))}
  </div>
);

export default TechStack;
