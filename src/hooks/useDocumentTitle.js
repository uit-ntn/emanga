import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · eManga` : 'eManga – Mỗi trang, một thế giới';
  }, [title]);
}
