import { useState } from 'react';

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (action) => {
    setLoading(true);
    setError('');
    try {
      return await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, run, clearError: () => setError('') };
}
