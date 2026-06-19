import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

// 全局提示浮层，3.2s 后自动消失
export default function Toast() {
  const toast = useGameStore((s) => s.toast);
  const setToast = useGameStore((s) => s.setToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed top-6 left-1/2 z-50 -translate-x-1/2 animate-slideUp">
      <div className="glass max-w-[90vw] rounded-xl px-5 py-3 text-center font-body text-mint-light shadow-mint-glow">
        {toast}
      </div>
    </div>
  );
}
