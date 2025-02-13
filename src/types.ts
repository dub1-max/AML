// src/types.ts

export interface SearchResult {
  id: number; // Add id, as it is auto-incremented in the database
  name: string;
  type: string;
  country: string;
  identifiers: string;
  riskLevel: number;
  sanctions: string[]; // Good
  dataset: string;
  lastUpdated?: string; // Keep as optional string (ISO format)
}

export interface Tracking {
  [name: string]: {
      isTracking: boolean;
      startDate?: string; // ISO string, optional
      stopDate?: string;  // ISO string, optional
  };
}

export interface DailyData { // No changes needed here
  date: string;
  alerts: number;
  falsePositiveRate: number;
  riskScoreChanges: number;
}

export interface User {
  id: number; // Corrected to number
  email: string;
  name: string;
  role: 'admin' | 'user'; // Good
}

export interface AuthState {  //No change
  user: User | null;
  isAuthenticated: boolean;
}