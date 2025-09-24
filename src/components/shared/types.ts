'use client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type Category = {
  id: string;
  title: string;
};

export const categories: Category[] = [
  { id: 'summary', title: 'Summary' },
  { id: 'experience', title: 'Experience' },
  { id: 'projects-skills', title: 'Projects & Skills' },
  { id: 'education-achievements', title: 'Education & Achievements' },
  { id: 'contact', title: 'Contact' }
];



