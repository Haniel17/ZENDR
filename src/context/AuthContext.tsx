import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface DBStatus {
  isConnected: boolean;
  uri?: string;
  error?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  dbStatus: DBStatus;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('zendr_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DBStatus>({ isConnected: false });

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setDbStatus(data.database);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch DB status:', err);
    }
  };

  // Validate existing token
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkStatus();

      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('zendr_token');
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem('zendr_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      localStorage.setItem('zendr_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await checkStatus();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      localStorage.setItem('zendr_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await checkStatus();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during signup.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('zendr_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        dbStatus,
        login,
        register,
        logout,
        checkStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
