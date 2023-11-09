import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import clsx from 'clsx';

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={clsx('card flex flex-col items-center gap-3 p-8 text-center', className)} role="alert">
      <AlertTriangle className="h-10 w-10 text-amber-500" />
      <div>
        <p className="font-semibold">Đã có lỗi xảy ra</p>
        <p className="mt-1 text-sm text-zinc-500">{error?.message || 'Không thể tải dữ liệu.'}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={() => onRetry()}>
          <RotateCw className="h-4 w-4" /> Thử lại
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, children, className }) {
  return (
    <div className={clsx('flex flex-col items-center gap-3 px-4 py-16 text-center', className)}>
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800', className)} />;
}
