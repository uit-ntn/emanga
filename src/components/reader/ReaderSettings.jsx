import clsx from 'clsx';
import { updateSettings, useSettings } from '../../store/settings';

function Option({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="grid grid-flow-col gap-1 rounded-xl bg-zinc-800 p-1">
        {options.map(([k, v]) => (
          <button
            type="button"
            key={k}
            onClick={() => onChange(k)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              value === k ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-300 hover:bg-zinc-700'
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReaderSettings() {
  const { readerMode, readerFit, dataSaver } = useSettings();
  return (
    <div className="space-y-4">
      <Option
        label="Chế độ đọc"
        value={readerMode}
        onChange={(v) => updateSettings({ readerMode: v })}
        options={[
          ['vertical', 'Cuộn dọc'],
          ['single', 'Từng trang'],
        ]}
      />
      <Option
        label="Kích thước ảnh"
        value={readerFit}
        onChange={(v) => updateSettings({ readerFit: v })}
        options={[
          ['width', 'Vừa rộng'],
          ['height', 'Vừa cao'],
          ['original', 'Gốc'],
        ]}
      />
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-medium">Tiết kiệm dữ liệu</span>
          <span className="block text-xs text-zinc-400">Ảnh nén, tải nhanh hơn (khuyên dùng)</span>
        </span>
        <input
          type="checkbox"
          checked={dataSaver}
          onChange={(e) => updateSettings({ dataSaver: e.target.checked })}
          className="h-5 w-5 accent-brand-600"
        />
      </label>
      <div className="border-t border-zinc-800 pt-3 text-xs leading-relaxed text-zinc-400">
        <p className="mb-1 font-semibold text-zinc-300">Phím tắt</p>
        <p>← → : trang trước / sau (chế độ từng trang)</p>
        <p>[ ] : chương trước / sau</p>
        <p>M : đổi chế độ đọc · Esc : đóng</p>
      </div>
    </div>
  );
}
