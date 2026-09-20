export interface PersonalInfo {
  name: string;
  subtitle: string;
  description: string;
}

export interface ActivityItem {
  icon: string;
  title: string;
}

export interface SocialLink {
  href: string;
  title: string;
  icon: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
