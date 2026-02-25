import { useEffect } from 'react';
import { useStudioStore } from '../store/useStudioStore';

export function ToastStack() {
  const toasts = useStudioStore((s) => s.toasts);
  const remove = useStudioStore((s) => s.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => remove(toast.id), 2600));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.kind}`}>{toast.message}</div>
      ))}
    </div>
  );
}
