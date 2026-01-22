'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setAccessToken, getAccessToken } from './api-client';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();

      if (token) {
        try {
          // Verify token by fetching current user
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          // Token invalid, try to refresh
          try {
            const refreshResponse = await apiClient.post('/auth/refresh');
            const newToken = refreshResponse.data.data.accessToken;
            setAccessToken(newToken);

            // Fetch user again
            const userResponse = await apiClient.get('/auth/me');
            setUser(userResponse.data.data.user);
          } catch (refreshError) {
            setAccessToken(null);
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    const { user: userData, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });

    const { user: userData, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
