export enum ProjectCategory {
  ALL = 'All Projects',
  PLANTING = 'Horticulture & Planting',
  HARDSCAPING = 'Patios & Hardscaping',
  AQUEOUS = 'Water Features',
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  image: string;
  location: string;
  duration: string;
  keyMaterials: string[];
  keyHighlights: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  rating: number;
  projectType: string;
  content: string;
  date: string;
}

export interface CostEstimation {
  lawnSqFt: number;
  plantDensity: 'minimal' | 'moderate' | 'lush';
  hardscapeSize: 'none' | 'small' | 'large';
  features: string[]; // 'water', 'lighting', 'irrigation'
}

export interface BookingRequest {
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  notes: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  priceEstimate?: string;
  features: string[];
  iconName: 'shovel' | 'hammer' | 'droplet' | 'sun' | 'sparkles' | 'tree';
}

