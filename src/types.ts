// types.ts
export interface SearchResult {
  name: string;
  type: string;
  country: string;
  identifiers: string;
  riskLevel: number;
  sanctions: string[];
  dataset: string;
  lastUpdated?: string | null; // Changed to string | null for consistency
}

export interface Tracking {
  [name: string]: {
      isTracking: boolean;
      stopDate?: string; // ISO string
  };
}

export interface DailyData {
  date: string;
  alerts: number;
  falsePositiveRate: number;
  riskScoreChanges: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}