// src/types.ts

export interface SearchResult {
  id: number;
  name: string;
  type: string;
  country: string;
  identifiers: string;
  riskLevel: number;
  sanctions: string[];
  dataset: string;
  lastUpdated?: string;
  isBlacklisted?: boolean; // Indicates if this person was matched with a sanctioned entity
}

export interface TrackingItem {
  name: string;
  isTracking: number;  // Server sends 1 or 0
  startDate: string | null;
  stopDate: string | null;
  lastUpdated?: string;
}

export interface Tracking {
  [name: string]: {
      isTracking: boolean;
      startDate?: string;
      stopDate?: string;
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