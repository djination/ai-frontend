import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAccessToken, isAccessTokenExpired } from '../services/authSession';
import { fetchLearnerEntitlement } from '../services/contentEngineApi';

const LearnerEntitlementContext = createContext(null);

export function LearnerEntitlementProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isAccessTokenExpired()) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ent = await fetchLearnerEntitlement();
      setData(ent);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e : new Error('Gagal memuat paket'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      loading,
      data,
      error,
      refetch,
    }),
    [loading, data, error, refetch],
  );

  return <LearnerEntitlementContext.Provider value={value}>{children}</LearnerEntitlementContext.Provider>;
}

export function useLearnerEntitlement() {
  const ctx = useContext(LearnerEntitlementContext);
  if (!ctx) {
    throw new Error('useLearnerEntitlement must be used within LearnerEntitlementProvider');
  }
  return ctx;
}
