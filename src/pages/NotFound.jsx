import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Không tìm thấy trang');
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">Trang này không tồn tại</h1>
        <p className="mt-2 text-zinc-500">Có thể đường dẫn đã bị đổi hoặc xoá.</p>
        <Link to="/" className="btn-primary mt-6">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
