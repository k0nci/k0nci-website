import { type PersonalInfo, type ActivityItem, type SocialLink } from '../types';
import { SiGithub, SiLinkedin } from 'react-icons/si';
import { PiPersonSimpleBike, PiPersonSimpleSnowboard, PiMountains } from 'react-icons/pi';

export const personalInfo: PersonalInfo = {
  name: 'Matej Koncal',
  subtitle: 'Software Engineer & Mountain Enthusiast',
};

export const technologies = ['Backend', 'Cloud', 'Microservices', 'DevOps'];

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
