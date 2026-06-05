import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLeadsStore } from '@/stores/leadsStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  Columns3,
  Handshake,
  BarChart3,
  LogOut,
  Building2,
  Network,
  UserCog,
  LockKeyhole,
} from 'lucide-react';

type AdminAccessRole = 'master' | 'company' | 'manager' | 'consultant' | 'unknown'; 

type CompanyInfo = {
  id?: string | null;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
};

type LoggedUserInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

const navItems = [
  { icon: LockKeyhole,  label: 'Senha',  path: '/admin/alterar-senha',  roles: ['master', 'company', 'manager', 'consultant'] },
  { icon: Network, label: 'Matriz', path: '/admin/matriz', roles: ['master'] },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['master', 'company', 'manager', 'consultant'] },
  { icon: Users, label: 'Leads', path: '/admin/leads', roles: ['master', 'company', 'manager', 'consultant'] },
  { icon: Columns3, label: 'Kanban', path: '/admin/kanban', roles: ['master', 'company', 'manager', 'consultant'] },
  { icon: Handshake, label: 'Empresas', path: '/admin/parceiros', roles: ['master'] },
  { icon: UserCog, label: 'Equipe', path: '/admin/equipe', roles: ['master', 'company', 'manager'] },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios', roles: ['master', 'company', 'manager'] },
];

function normalizeRole(role?: string | null): AdminAccessRole {
  if (!role) return 'unknown';

  if (['admin', 'master_admin', 'admin_epsa', 'matriz', 'owner'].includes(role)) return 'master';
  if (['company_admin', 'partner_admin', 'empresa_parceira', 'contratante'].includes(role)) return 'company';
  if (['company_manager', 'manager', 'gestor'].includes(role)) return 'manager';
  if (['company_consultant', 'consultant', 'consultor'].includes(role)) return 'consultant';

  return 'unknown';
}

function roleLabel(role: AdminAccessRole) {
  if (role === 'company') return 'Empresa Parceira / Contratante';
  if (role === 'manager') return 'Gestor da Empresa';
  if (role === 'consultant') return 'Consultor da Empresa';
  if (role === 'master') return 'Admin EPSA / Matriz';
  return 'Usuário';
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useLeadsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [accessRole, setAccessRole] = useState<AdminAccessRole>('unknown');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loggedUserInfo, setLoggedUserInfo] = useState<LoggedUserInfo | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    async function loadAccessRole() {
      if (!isAuthenticated) {
        setIsCheckingRole(false);
        return;
      }

      try {
        if (!isSupabaseConfigured) {
          setAccessRole('master');
          setCompanyInfo(null);
          setLoggedUserInfo(null);
          setIsCheckingRole(false);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        const authEmail = userData.user?.email || null;

        if (!userId) {
          setAccessRole('unknown');
          setCompanyInfo(null);
          setLoggedUserInfo(null);
          setIsCheckingRole(false);
          return;
        }

        const { data: adminUser } = await supabase
          .from('mci_admin_users')
          .select('role,status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (adminUser) {
          setAccessRole(normalizeRole(adminUser.role));
          setCompanyInfo(null);
          setLoggedUserInfo({ name: 'Admin EPSA', email: authEmail });
          setIsCheckingRole(false);
          return;
        }

        const { data: companyUser, error: companyUserError } = await supabase
          .from('partner_company_users')
          .select('role,status,company_id,name,email,phone')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (companyUserError) throw companyUserError;

        if (companyUser) {
          const role = normalizeRole(companyUser.role);
          setAccessRole(role);

          let company: any = null;

          if (companyUser.company_id) {
            const { data: companyData, error: companyError } = await supabase
              .from('partner_companies')
              .select('id,name,display_name,slug,logo_url,status')
              .eq('id', companyUser.company_id)
              .maybeSingle();

            if (companyError) throw companyError;
            company = companyData;
          }

          setCompanyInfo(company ? {
            id: company.id,
            name: company.display_name || company.name || 'Empresa Parceira',
            slug: company.slug,
            logoUrl: company.logo_url,
          } : {
            id: companyUser.company_id,
            name: 'Empresa Parceira',
            slug: null,
            logoUrl: null,
          });

          setLoggedUserInfo({
            name: companyUser.name || companyUser.email || authEmail || null,
            email: companyUser.email || authEmail,
            phone: companyUser.phone || null,
          });

          setIsCheckingRole(false);
          return;
        }

        setAccessRole('unknown');
        setCompanyInfo(null);
        setLoggedUserInfo({ email: authEmail });
      } catch (error) {
        console.error('Erro ao verificar perfil de acesso:', error);
        setAccessRole('unknown');
        setCompanyInfo(null);
        setLoggedUserInfo(null);
      } finally {
        setIsCheckingRole(false);
      }
    }

    loadAccessRole();
  }, [isAuthenticated]);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => item.roles.includes(accessRole));
  }, [accessRole]);

  const isMasterAdmin = accessRole === 'master';

  useEffect(() => {
    if (!isAuthenticated || isCheckingRole) return;

    const restrictedToMaster = location.pathname.startsWith('/admin/parceiros') || location.pathname.startsWith('/admin/matriz');
    const restrictedToTeamManagers = location.pathname.startsWith('/admin/equipe') && !['master', 'company', 'manager'].includes(accessRole);

    if ((restrictedToMaster && !isMasterAdmin) || restrictedToTeamManagers) {
      navigate('/admin/leads', { replace: true });
    }
  }, [accessRole, isAuthenticated, isCheckingRole, isMasterAdmin, location.pathname, navigate]);

  if (!isAuthenticated) return null;

  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-[var(--light-gray)] flex items-center justify-center text-sm text-[var(--text-muted)]">
        Verificando perfil de acesso...
      </div>
    );
  }

  const headerTitle = isMasterAdmin
    ? 'Admin EPSA / Matriz'
    : accessRole === 'company'
      ? companyInfo?.name || loggedUserInfo?.name || 'Empresa Parceira'
      : loggedUserInfo?.name || roleLabel(accessRole);

  const headerSubtitle = isMasterAdmin
    ? 'MCI Consórcio'
    : accessRole === 'company'
      ? `Empresa Parceira${companyInfo?.slug ? ` · ${companyInfo.slug}` : ''}`
      : `${roleLabel(accessRole)}${companyInfo?.name ? ` · ${companyInfo.name}` : ''}`;

  const bottomIdentity = !isMasterAdmin && accessRole !== 'company' && loggedUserInfo?.email
    ? loggedUserInfo.email
    : null;

  return (
    <div className="min-h-screen flex bg-[var(--light-gray)]">
      <aside className="hidden lg:flex w-64 flex-col bg-[hsl(var(--sidebar-background))] text-white fixed h-full">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
              {companyInfo?.logoUrl ? (
                <img src={companyInfo.logoUrl} alt={companyInfo.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="size-4 text-white" />
              )}
            </div>
            <div className="leading-tight min-w-0">
              <span className="block truncate font-semibold text-sm">{headerTitle}</span>
              <p className="truncate text-[11px] text-white/55">{headerSubtitle}</p>
              {bottomIdentity && <p className="truncate text-[10px] text-white/40">{bottomIdentity}</p>}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleNavItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-[hsl(var(--sidebar-accent))] text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/5'
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[hsl(var(--sidebar-background))] border-t border-white/10 z-50">
        <nav className="flex justify-around py-2">
          {visibleNavItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${active ? 'text-[hsl(var(--sidebar-primary))]' : 'text-white/60'}`}
              >
                <item.icon className="size-5" />
                <span className="truncate max-w-[72px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
