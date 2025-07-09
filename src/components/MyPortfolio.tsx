import React from 'react';
import type { Person } from 'schema-dts';
import { helmetJsonLdProp } from 'react-schemaorg';
import { useHead } from '@unhead/react';
// import AuroraBackground from './background/AuroraBackground';
import TwinklingStars from './background/TwinklingStars';
import MountainLayers from './background/MountainLayers';
import HeroTitle from './content/HeroTitle';
import TechStack from './content/TechStack';
import ActivityIcons from './content/ActivityIcons';
import SocialLinks from './content/SocialLinks';
import {
  personalInfo,
  technologies,
  activities,
  socialLinks,
  seoStructuredData,
} from '../data/portfolioData';

const MountainPortfolio: React.FC = () => {
  useHead({
    /* Structured data for SEO */
    script: [helmetJsonLdProp<Person>(seoStructuredData)],
  });

  return (
    <div
      className="relative h-screen overflow-hidden font-sans text-white"
      style={{
        background:
          'linear-gradient(135deg, #2c3e50 0%, #4a69bd 20%, #3c6382 40%, #40739e 60%, #487eb0 80%, #5b73e8 100%)',
      }}
    >
      {/* <AuroraBackground /> */}
      <TwinklingStars />
      <MountainLayers className="z-10" />
      <div className="relative z-20 flex h-full items-center justify-center">
        <div className="animate-fadeInUp px-4 text-center">
          <HeroTitle name={personalInfo.name} subtitle={personalInfo.subtitle} className="mb-14" />
          <TechStack technologies={technologies} className="mb-14" />
          <ActivityIcons activities={activities} className="mb-12" />
          <SocialLinks links={socialLinks} />
        </div>
      </div>

      {/* Copyright notice */}
      <div className="absolute right-4 bottom-2 z-30">
        <p className="text-[0.5rem] text-white/60">Built by k0nci with AI help • 2025</p>
      </div>
    </div>
  );
};

export default MountainPortfolio;
