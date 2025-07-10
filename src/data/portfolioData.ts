import type { PersonalInfo, ActivityItem, SocialLink } from '../types';
import { SiGithub, SiLinkedin } from 'react-icons/si';
import { PiPersonSimpleBike, PiPersonSimpleSnowboard, PiMountains } from 'react-icons/pi';
import type { ProfilePage, WithContext } from 'schema-dts';

export const personalInfo: PersonalInfo = {
  name: 'Matej Koncal',
  subtitle: 'Software Engineer & Mountain Enthusiast',
};

export const technologies = ['Backend', 'Cloud', 'Architecture', 'DevOps'];

export const activities: ActivityItem[] = [
  { icon: PiPersonSimpleBike, title: 'Mountain Biking' },
  { icon: PiMountains, title: 'Mountains' },
  { icon: PiPersonSimpleSnowboard, title: 'Snowboarding' },
];

export const socialLinks: SocialLink[] = [
  {
    href: 'https://github.com/k0nci',
    title: 'GitHub',
    icon: SiGithub,
  },
  {
    href: 'https://linkedin.com/in/mkoncal',
    title: 'LinkedIn',
    icon: SiLinkedin,
  },
];

export const seoStructuredData: WithContext<ProfilePage> = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: personalInfo.name,
    jobTitle: 'Software Engineer',
    url: 'https://k0nci.me',
    sameAs: ['https://github.com/k0nci', 'https://linkedin.com/in/mkoncal'],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: ['Slovak Technical University', 'Faculty of Informatics and Information Technologies'],
    },
    knowsAbout: ['Backend Development', 'Cloud Computing', 'Software Architecture'],
  },
};
