/**
 * Types and interfaces for FounderBrief app.
 */

export interface BriefAnswers {
  platform: 'Android' | 'iPhone' | 'Both';
  platformDetails: string;
  auth: string;
  authDetails: string;
  integrations: string;
  integrationsDetails: string;
  design: string;
  designDetails: string;
  timeline: string;
  timelineDetails: string;
}

export interface ProjectBrief {
  id: string;
  title: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
  estimatedBudget: string;
  coreFeatures: string[];
  userStories: string[];
  devQuestions: string[];
  createdAt: string;
  originalIdea: string;
  answers: BriefAnswers;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  isLoggedIn: boolean;
}
