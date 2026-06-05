import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AdminAccessRole = 'master' | 'company' | 'manager' | 'consultant' | 'unknown';

export type AdminAccess = {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  companyId: string | null;
  companySlug: string | null;
  companyName: string | null;
  role: AdminAccessRole;
  isMasterAdmin: boolean;
  isCompanyAdmin: boolean;
  isCompanyManager: boolean;
  isCompanyUser: boolean;
  isConsultant: boolean;
  canManageTeam: boolean;
  isLoading: boolean;
};

function normalizeRole(role?: string | null): AdminAccessRole {
  if (!role) return 'unknown';

  if (['admin', 'master_admin', 'admin_epsa', 'matriz', 'owner'].includes(role)) return 'master';
  if (['company_admin', 'partner_admin', 'empresa_parceira', 'contratante'].includes(role)) return 'company';
  if (['company_manager', 'manager', 'gestor'].includes(role)) return 'manager';
  if (['company_consultant', 'consultant', 'consultor'].includes(role)) return 'consultant';

  return 'unknown';
}

export function useAdminAccess(): AdminAccess {
  const [state, setState] = useState<Omit<AdminAccess, 'isMasterAdmin' | 'isCompanyAdmin' | 'isCompanyManager' | 'isCompanyUser' | 'isConsultant' | 'canManageTeam'>>({
    userId: null,
    userName: null,
    userEmail: null,
    userPhone: null,
    companyId: null,
    companySlug: null,
    companyName: null,
    role: 'unknown',
    isLoading: true,
  });

  useEffect(() => {
    async function loadAccess() {
      try {
        if (!isSupabaseConfigured) {
          setState({
            userId: null,
            userName: 'Admin EPSA',
            userEmail: null,
            userPhone: null,
            companyId: null,
            companySlug: null,
            companyName: null,
            role: 'master',
            isLoading: false,
          });
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id || null;
        const authEmail = userData.user?.email || null;

        if (!userId) {
          setState({
            userId: null,
            userName: null,
            userEmail: null,
            userPhone: null,
            companyId: null,
            companySlug: null,
            companyName: null,
            role: 'unknown',
            isLoading: false,
          });
          return;
        }

        const { data: adminUser } = await supabase
          .from('mci_admin_users')
          .select('role,status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (adminUser) {
          setState({
            userId,
            userName: 'Admin EPSA',
            userEmail: authEmail,
            userPhone: null,
            companyId: null,
            companySlug: null,
            companyName: null,
            role: normalizeRole(adminUser.role),
            isLoading: false,
          });
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
          let company: any = null;

          if (companyUser.company_id) {
            const { data: companyData, error: companyError } = await supabase
              .from('partner_companies')
              .select('id,name,display_name,slug,status')
              .eq('id', companyUser.company_id)
              .maybeSingle();

            if (companyError) throw companyError;
            company = companyData;
          }

          setState({
            userId,
            userName: companyUser.name || companyUser.email || authEmail,
            userEmail: companyUser.email || authEmail,
            userPhone: companyUser.phone || null,
            companyId: companyUser.company_id || company?.id || null,
            companySlug: company?.slug || null,
            companyName: company?.display_name || company?.name || null,
            role: normalizeRole(companyUser.role),
            isLoading: false,
          });
          return;
        }

        setState({
          userId,
          userName: authEmail,
          userEmail: authEmail,
          userPhone: null,
          companyId: null,
          companySlug: null,
          companyName: null,
          role: 'unknown',
          isLoading: false,
        });
      } catch (error) {
        console.error('Erro ao verificar perfil de acesso:', error);
        setState({
          userId: null,
          userName: null,
          userEmail: null,
          userPhone: null,
          companyId: null,
          companySlug: null,
          companyName: null,
          role: 'unknown',
          isLoading: false,
        });
      }
    }

    void loadAccess();
  }, []);

  const isMasterAdmin = state.role === 'master';
  const isCompanyAdmin = state.role === 'company';
  const isCompanyManager = state.role === 'manager';
  const isConsultant = state.role === 'consultant';
  const isCompanyUser = isCompanyAdmin || isCompanyManager || isConsultant;
  const canManageTeam = isMasterAdmin || isCompanyAdmin || isCompanyManager;

  return {
    ...state,
    isMasterAdmin,
    isCompanyAdmin,
    isCompanyManager,
    isCompanyUser,
    isConsultant,
    canManageTeam,
  };
}
