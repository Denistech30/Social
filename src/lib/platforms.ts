import type { Platform } from '../types';

export const platforms: Platform[] = [
  { id: 'twitter', name: 'Twitter / X', charLimit: 280, icon: 'twitter', color: 'bg-black' },
  { id: 'instagram', name: 'Instagram', charLimit: 2200, icon: 'instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-600' },
  { id: 'linkedin', name: 'LinkedIn', charLimit: 3000, icon: 'linkedin', color: 'bg-blue-600' },
  { id: 'facebook', name: 'Facebook', charLimit: 63206, icon: 'facebook', color: 'bg-blue-500' },
  { id: 'tiktok', name: 'TikTok', charLimit: 2200, icon: 'music', color: 'bg-black' },
  { id: 'threads', name: 'Threads', charLimit: 500, icon: 'message-circle', color: 'bg-gray-900' },
];

export function getPlatformById(id: string): Platform | undefined {
  return platforms.find((p) => p.id === id);
}

export function getPlatformByName(name: string): Platform | undefined {
  return platforms.find((p) => p.name === name);
}
