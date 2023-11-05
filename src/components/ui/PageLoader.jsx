export default function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Đang tải">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600/20 border-t-brand-600" />
    </div>
  );
}
