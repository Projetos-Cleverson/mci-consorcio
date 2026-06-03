import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--deep-blue)] shadow-sm">
            <Building2 className="size-5 text-white" />
          </div>

          <div className="leading-tight">
            <p className="font-sans text-sm font-bold text-[var(--deep-blue)] sm:text-base">
              MCI
            </p>
            <p className="hidden text-xs font-medium text-slate-500 sm:block">
              Diagnóstico de Compra Planejada
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:flex">
          <span>Uma ferramenta da</span>
          <span className="font-semibold text-[var(--deep-blue)]">
            Universidade EPSA
          </span>
        </div>

        <Link
          to="/diagnostico"
          className="rounded-xl bg-[var(--green-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--green-light)]"
        >
          Iniciar diagnóstico
        </Link>
      </div>
    </header>
  );
}