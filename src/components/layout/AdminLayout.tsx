import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLeadsStore } from '@/stores/leadsStore';
import {
  LayoutDashboard,
  Users,
  Columns3,
  Handshake,
  BarChart3,
  LogOut,
  Building2,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Leads', path: '/admin/leads' },
  { icon: Columns3, label: 'Kanban', path: '/admin/kanban' },
  { icon: Handshake, label: 'Empresas', path: '/admin/parceiros' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useLeadsStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-[var(--light-gray)]">
      <aside className="hidden lg:flex w-64 flex-col bg-[hsl(var(--sidebar-background))] text-white fixed h-full">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="size-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Painel Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[hsl(var(--sidebar-accent))] text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[hsl(var(--sidebar-background))] border-t border-white/10 z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${
                  active ? 'text-[hsl(var(--sidebar-primary))]' : 'text-white/60'
                }`}
              >
                <item.icon className="size-5" />
                <span className="truncate max-w-[72px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
