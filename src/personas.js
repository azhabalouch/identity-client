import { Briefcase, Gamepad2, Users } from 'lucide-react';

// Product name shown in the sidebar and on the sign-in screens.
export const APP_NAME = 'Manage Personas';

// The API context values never change. Only the text and colours shown on
// screen live here. Tailwind needs full class names, so they are written out.
export const PERSONAS = [
  {
    context: 'professional',
    label: 'Professional',
    summary: 'Work, career and contact details',
    Icon: Briefcase,
    text: 'text-professional',
    banner: 'bg-professional/25',
  },
  {
    context: 'personal',
    label: 'Personal',
    summary: 'Friends, family and everyday life',
    Icon: Users,
    text: 'text-personal',
    banner: 'bg-personal/25',
  },
  {
    context: 'gaming',
    label: 'Gaming',
    summary: 'Gamer tags and online play',
    Icon: Gamepad2,
    text: 'text-gaming',
    banner: 'bg-gaming/25',
  },
];

export const findPersona = (context) =>
  PERSONAS.find((p) => p.context === context);

// Keys are the API values. Labels are what the user reads.
export const VISIBILITY = {
  public: 'Public',
  consented: 'Consented apps',
  private: 'Private',
};

export function initials(text) {
  const parts = (text || '?').replace(/@.*/, '').split(/[\s._-]+/);
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
