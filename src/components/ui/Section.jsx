import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Section({ title, icon: Icon, to, linkLabel = 'Xem tất cả', children }) {
  return (
    <section className="container-page mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="section-title flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-brand-600" />}
          {title}
        </h2>
        {to && (
          <Link
            to={to}
            className="inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 hover:text-brand-600"
          >
            {linkLabel} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
