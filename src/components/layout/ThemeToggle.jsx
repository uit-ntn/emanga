import { Monitor, Moon, Sun } from 'lucide-react';
import { updateSettings, useSettings } from '../../store/settings';

const ORDER = ['light', 'dark', 'system'];
const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: 'Giao diện sáng', dark: 'Giao diện tối', system: 'Theo hệ thống' };

export default function ThemeToggle() {
  const theme = useSettings((s) => s.theme);
  const Icon = ICONS[theme] ?? Monitor;
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  return (
    <button
      type="button"
      className="btn-ghost btn-icon"
      onClick={() => updateSettings({ theme: next })}
      title={LABELS[theme]}
      aria-label={`${LABELS[theme]} – bấm để đổi`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
