import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface VaultItem {
  _id: string;
  userId: string;
  mode: 'png-to-svg' | 'svg-to-png';
  fileName: string;
  fileSizeBytes: number;
  outputSizeBytes: number;
  width: number;
  height: number;
  pathCount?: number;
  executionTimeMs?: number;
  previewSvgSnippet?: string;
  createdAt: string;
}

interface VaultContextType {
  conversions: VaultItem[];
  isLoadingVault: boolean;
  saveToVault: (item: Omit<VaultItem, '_id' | 'userId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  deleteFromVault: (id: string) => Promise<boolean>;
  refreshVault: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [conversions, setConversions] = useState<VaultItem[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  const refreshVault = useCallback(async () => {
    if (!token) {
      setConversions([]);
      return;
    }

    setIsLoadingVault(true);
    try {
      const res = await fetch('/api/conversions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversions(data.conversions || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversion history:', err);
    } finally {
      setIsLoadingVault(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      void refreshVault();
    } else {
      setConversions([]);
    }
  }, [user, token, refreshVault]);

  const saveToVault = async (item: Omit<VaultItem, '_id' | 'userId' | 'createdAt'>) => {
    if (!token) {
      return { success: false, error: 'Please sign in to save conversions to your vault.' };
    }

    try {
      const res = await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to save to vault.' };
      }

      await refreshVault();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while saving.' };
    }
  };

  const deleteFromVault = async (id: string) => {
    if (!token) return false;

    try {
      const res = await fetch(`/api/conversions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversions((prev) => prev.filter((c) => c._id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete conversion record:', err);
      return false;
    }
  };

  return (
    <VaultContext.Provider
      value={{
        conversions,
        isLoadingVault,
        saveToVault,
        deleteFromVault,
        refreshVault
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = (): VaultContextType => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
