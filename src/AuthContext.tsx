// src/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthState, User } from './types';
import { getApiBaseUrl } from './config';

interface AuthContextProps {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
    logout: () => Promise<void>; // Make logout async
    loading: boolean;
}

const API_BASE_URL = getApiBaseUrl();

const AuthContext = createContext<AuthContextProps>({
    user: null,
    isAuthenticated: false,
    login: async () => false,
    register: async () => false,
    logout: async () => { },
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
    });
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            // *** IMPORTANT: Include credentials for cross-origin requests ***
            const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAuthState({ user: data.user, isAuthenticated: true });
            } else {
                setAuthState({ user: null, isAuthenticated: false });
                // Only log an error if it's NOT a 401 (unauthorized)
                if (response.status !== 401) {
                    console.error("Failed to fetch user:", response.status);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setAuthState({ user: null, isAuthenticated: false }); // Clear user on network errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);  //Set loading here
        try {
            // *** IMPORTANT: Include credentials for cross-origin requests ***
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Send cookies
            });

            if (response.ok) {
                const data = await response.json();
                setAuthState({ user: data.user, isAuthenticated: true });
                return true;
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData.message);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setLoading(false); // Set loading to false after login attempt
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name: string, role: string) => {
        setLoading(true); //set loading here
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, role }),
                // No 'include' needed for register; it doesn't rely on existing session
            });

            if (response.ok) {
                // Optionally, auto-login the user after successful registration
                // This would involve calling `login` here.  But, it's often better
                // to let the user explicitly log in.
                return true;
            } else {
                const errorData = await response.json();
                console.error('Registration failed:', errorData.message);
                return false;
            }


        } catch (error) {
            console.error('Registration error:', error);
            return false;
        } finally {
          setLoading(false); //set loading to false.
        }
    }, []);

    const logout = useCallback(async () => {
      setLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include', // Important for clearing the session cookie
          });

          if (response.ok) {
              setAuthState({ user: null, isAuthenticated: false });
          } else {
              console.error('Logout failed:', response.status);
          }
      } catch (error) {
          console.error('Logout error:', error);
      } finally {
          setLoading(false);
      }
  }, []);


    const contextValue: AuthContextProps = {
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        login,
        register,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
          {children}
        </AuthContext.Provider>
    );
};