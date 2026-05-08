import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';

export function useSessionRole() {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.ROLE) ?? '');

  useEffect(() => {
    if (!role) {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  return {
    role,
    isLearner: role === 'learner',
    isAdmin: role === 'admin',
    setRole,
    clearRole: () => setRole(''),
  };
}
