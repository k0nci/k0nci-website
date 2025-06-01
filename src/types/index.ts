import { type IconType } from 'react-icons';

export interface PersonalInfo {
  name: string;
  subtitle: string;
}

export interface ActivityItem {
  icon: IconType;
  title: string;
}

export interface SocialLink {
  href: string;
  title: string;
  icon: IconType;
}
