"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, validateCredentials } from '@/lib/data-service';
import Cookies from 'js-cookie';

// Use unique storage keys with a prefix
const AUTH_STORAGE_KEY = 'eventvibe_auth_user';
const AUTH_TIMESTAMP_KEY = 'eventvibe_auth_timestamp';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to clear all auth data
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    Cookies.remove('user', { path: '/' });
  };

  // Check if the stored session is still valid based on timestamp
  const isSessionValid = (): boolean => {
    try {
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
      if (!timestamp) return false;
      
      const loginTime = parseInt(timestamp, 10);
      const currentTime = new Date().getTime();
      
      // Check if the session has expired
      return currentTime - loginTime < SESSION_MAX_AGE;
    } catch (error) {
      return false;
    }
  };

  // On mount, check localStorage and cookies for user data
  useEffect(() => {
    try {
      // First verify the session is still valid
      if (isSessionValid()) {
        // Then check for user data
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          clearAuthData(); // Clear partial data if user data is missing
        }
      } else {
        // Session expired, clear all auth data
        clearAuthData();
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      // Clear potentially corrupted data
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      
      // First clear any existing auth data
      clearAuthData();
      
      const loggedInUser = await validateCredentials(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        
        // Save to localStorage with current timestamp
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
        localStorage.setItem(AUTH_TIMESTAMP_KEY, String(new Date().getTime()));
        
        // Save to cookies for middleware access
        Cookies.set('user', JSON.stringify(loggedInUser), { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict'
        });
      }
      
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }
      
      const newUser = await response.json();
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    // Force reload to clear any component state
    window.location.href = '/';
  };

  // Periodically check session validity (every minute)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user && !isSessionValid()) {
        clearAuthData();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 