"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { User } from "@/lib/instagram-client";

interface IGAuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isChallengeRequired: boolean;
  resetChallengeState: () => void;
}

const IGAuthContext = createContext<IGAuthContextType | null>(null);

export function IGAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChallengeRequired, setIsChallengeRequired] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real implementation, we would check with our API if the stored token/cookies are valid
        const storedUser = localStorage.getItem('ig_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        // Clear any invalid data
        localStorage.removeItem('ig_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    setIsChallengeRequired(false);
    
    try {
      const response = await fetch('/api/instagram/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Check if it's a challenge required error
        if (data.challengeRequired) {
          setIsChallengeRequired(true);
          throw new Error(data.error || 'Security verification required');
        }
        
        throw new Error(data.error || 'Login failed');
      }
      
      // Store user data
      setUser(data.user);
      localStorage.setItem('ig_user', JSON.stringify(data.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout endpoint to clear server-side session
      await fetch('/api/instagram/logout', {
        method: 'POST',
      });
      
      // Clear client-side data
      localStorage.removeItem('ig_user');
      setUser(null);
      setIsAuthenticated(false);
      setIsChallengeRequired(false);
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear local data even if server-side logout fails
      localStorage.removeItem('ig_user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const resetChallengeState = () => {
    setIsChallengeRequired(false);
    setError(null);
  };

  const contextValue: IGAuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error,
    isChallengeRequired,
    resetChallengeState
  };

  return React.createElement(
    IGAuthContext.Provider,
    { value: contextValue },
    children
  );
}

export const useIGAuth = () => {
  const context = useContext(IGAuthContext);
  if (!context) {
    throw new Error('useIGAuth must be used within an IGAuthProvider');
  }
  return context;
} 