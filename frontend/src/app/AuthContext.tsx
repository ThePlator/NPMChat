'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getToken } from './fetcher';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (t) checkAuth();
    else setLoading(false);
  }, []);

  async function signup(data: any) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/signup', data, 'auth');
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (e: any) {
      setError(e.message || 'Signup failed');
      setLoading(false);
      throw e;
    }
  }

  async function login(data: any) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/login', data, 'auth');
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (e: any) {
      setError(e.message || 'Login failed');
      setLoading(false);
      throw e;
    }
  }

  async function checkAuth() {
    setLoading(true);
    try {
      const res = await api.get('/check-auth', 'auth');
      setUser(res.user);
    } catch {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  async function updateProfile(data: any) {
    setLoading(true);
    try {
      const res = await api.put('/update-profile', data, 'auth');
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (e: any) {
      setError(e.message || 'Update failed');
      setLoading(false);
      throw e;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        checkAuth,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
