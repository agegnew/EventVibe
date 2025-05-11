"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, validateCredentials } from '@/lib/data-service';
import Cookies from 'js-cookie';
import { useRealtimeSync } from '@/lib/realtime-sync';

// Use unique storage keys with a prefix
const AUTH_STORAGE_KEY = 'eventvibe_auth_user';
const AUTH_TIMESTAMP_KEY = 'eventvibe_auth_timestamp';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginWith42: () => void;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
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
    Cookies.remove('auth_timestamp', { path: '/' });
  };

  // Function to update user data and persist it 
  const updateUserData = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update localStorage and cookies
    const userJson = JSON.stringify(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, userJson);
    Cookies.set('user', userJson, { 
      expires: 1, // 1 day
      path: '/',
      sameSite: 'lax'
    });
    
    console.log('[Auth] User data updated:', userData);
  };
  
  // Listen for user-updated events from realtime sync
  const handleUserUpdated = (updatedUserData: Partial<User> & { id: string }) => {
    if (user && updatedUserData.id === user.id) {
      console.log('[Auth] Received user update:', updatedUserData);
      updateUserData(updatedUserData);
    }
  };
  
  // Subscribe to realtime updates if available
  if (typeof window !== 'undefined') {
    useRealtimeSync('user-updated', handleUserUpdated);
  }

  // Check if the stored session is still valid based on timestamp
  const isSessionValid = (): boolean => {
    try {
      // First check cookie timestamp (for OAuth login)
      const cookieTimestamp = Cookies.get('auth_timestamp');
      if (cookieTimestamp) {
        const loginTime = parseInt(cookieTimestamp, 10);
        const currentTime = new Date().getTime();
        return currentTime - loginTime < SESSION_MAX_AGE;
      }
      
      // Then check localStorage timestamp (for email/password login)
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
      if (!timestamp) return false;
      
      const loginTime = parseInt(timestamp, 10);
      const currentTime = new Date().getTime();
      
      // Check if the session has expired
      return currentTime - loginTime < SESSION_MAX_AGE;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  };

  // On mount, check cookies first (for OAuth) then localStorage for user data
  useEffect(() => {
    try {
      // First check for cookie-based auth (42 OAuth)
      const userCookie = Cookies.get('user');
      if (userCookie) {
        try {
          console.log('Found user cookie, checking validity');
          const userData = JSON.parse(userCookie);
          setUser(userData);
          
          // Save to localStorage for consistency
          localStorage.setItem(AUTH_STORAGE_KEY, userCookie);
          
          const cookieTimestamp = Cookies.get('auth_timestamp');
          if (cookieTimestamp) {
            localStorage.setItem(AUTH_TIMESTAMP_KEY, cookieTimestamp);
          } else {
            // If no timestamp in cookie, set current time
            const now = String(new Date().getTime());
            localStorage.setItem(AUTH_TIMESTAMP_KEY, now);
            Cookies.set('auth_timestamp', now, { 
              expires: 1, // 1 day
              path: '/',
              sameSite: 'lax'
            });
          }
          
          console.log('Loaded user from cookie:', userData.name);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing user cookie:', error);
          Cookies.remove('user');
          Cookies.remove('auth_timestamp');
        }
      }
      
      // Then check localStorage if cookie auth failed
      if (isSessionValid()) {
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('Loaded user from localStorage:', userData.name);
          
          // Also set cookie for cross-tab consistency
          Cookies.set('user', savedUser, { 
            expires: 1, // 1 day
            path: '/',
            sameSite: 'lax'
          });
          
          const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
          if (timestamp) {
            Cookies.set('auth_timestamp', timestamp, { 
              expires: 1, // 1 day
              path: '/',
              sameSite: 'lax'
            });
          }
        } else {
          console.log('No user data found in localStorage');
          clearAuthData(); // Clear partial data if user data is missing
        }
      } else {
        console.log('Session expired or invalid');
        // Session expired, clear all auth data
        clearAuthData();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
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
        console.log('User logged in:', loggedInUser.name);
        
        // Save to localStorage with current timestamp
        const userJson = JSON.stringify(loggedInUser);
        const timestamp = String(new Date().getTime());
        
        localStorage.setItem(AUTH_STORAGE_KEY, userJson);
        localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp);
        
        // Save to cookies for middleware access and cross-tab consistency
        Cookies.set('user', userJson, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'lax'
        });
        
        Cookies.set('auth_timestamp', timestamp, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'lax'
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

  // Login with 42 OAuth
  const loginWith42 = () => {
    console.log('Redirecting to 42 OAuth');
    window.location.href = '/api/auth/42';
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
    console.log('Logging out user');
    clearAuthData();
    // Force reload to clear any component state
    window.location.href = '/';
  };

  // Periodically check session validity (every minute)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user && !isSessionValid()) {
        console.log('Session expired, logging out');
        clearAuthData();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWith42, 
      signup, 
      logout,
      updateUserData,
      isLoggedIn, 
      isAdmin 
    }}>
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