import { Facebook, Github, Instagram, Linkedin } from 'lucide-react';

const ICONS = { facebook: Facebook, linkedin: Linkedin, instagram: Instagram, github: Github };

export default function SocialIcon({ name, className = 'h-4 w-4' }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className={className} /> : null;
}
