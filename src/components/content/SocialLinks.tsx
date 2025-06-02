import React from 'react';
import type { SocialLink } from '../../types';

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ links, className = '' }) => (
  <div className={`${className} flex justify-center gap-12`}>
    {links.map((link) => {
      const IconComponent = link.icon;
      return (
        <a
          key={link.title}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.title}
          className="text-white/80 transition-all duration-300 hover:-translate-y-2 hover:text-white hover:drop-shadow-lg"
        >
          <IconComponent size={24} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
