export function StatusMessage({ type = 'info', message }) {
  if (!message) {
    return null;
  }

  const styles = {
    info:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
    error:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
