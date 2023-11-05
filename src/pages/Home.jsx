import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle();
  return (
    <div className="container-page py-16">
      <h1 className="text-3xl font-extrabold">eManga</h1>
    </div>
  );
}
