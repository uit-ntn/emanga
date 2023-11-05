import { useEffect } from 'react';
import { applyTheme, useSettings } from '../store/settings';

export function useThemeSync() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);
}
