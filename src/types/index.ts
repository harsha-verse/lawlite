export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep'
] as const;

export type IndianState = typeof INDIAN_STATES[number];

export const LEGAL_HELP_TYPES = [
  'Property & Rental',
  'Family & Domestic',
  'Criminal & Police',
  'Consumer Rights',
  'Employment & Labour',
  'Business & MSME',
  'Cyber & Online',
  'Traffic & Motor Vehicle',
  'Constitutional Rights',
  'General Legal Awareness'
] as const;

export type LegalHelpType = typeof LEGAL_HELP_TYPES[number];

export interface UserPreferences {
  selectedState?: IndianState;
  preferredLanguage?: string;
  legalHelpType?: LegalHelpType;
}

export interface User {
  id: string;
  email: string;
  type: 'user' | 'lawyer';
  name?: string;
  licenseNumber?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  photo?: string;
  rating?: number;
  reviews?: Review[];
  verified?: boolean;
  preferences?: UserPreferences;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  language: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot' | 'lawyer';
  timestamp: string;
  attachments?: string[];
}

export interface Consultant {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  fee: number;
  rating: number;
  photo: string;
  verified: boolean;
  description: string;
}
