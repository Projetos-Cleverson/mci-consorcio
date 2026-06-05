import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { supabase } from '@/lib/supabase';
import {
  Building2,
  CheckCircle2,
  Copy,
  KeyRound,
  Link2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';

type Company = {
  id: string;
  name: string;
  display_name: string | null;
  slug: string;
  status: string | null;
};

type TeamMember = {
  id: string;
  company_id: string;
  user_id: string | null;
  role: string;
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type CreatedLogin = {
  memberId: string;
  email: string;
  temporaryPassword: string;
  userId: string;
  action?: 'create_login' | 'reset_password';
};

const roleLabels: Record<string, string> = {
  company_admin: 'Empresa Parceira / Contratante',
  company_manager: 'Gestor da Empresa',
  company_consultant: 'Consultor da Empresa',
};

const statusLabels: Record<string, string> = {
  pending_auth: 'Pendente de login',
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
};

function roleBadgeColor(role: string) {
  if (role === 'company_admin') return 'bg-blue-50 text-blue-700';
  if (role === 'company_manager') return 'bg-violet-50 text-violet-700';
  return 'bg-emerald-50 text-emerald-700';
}

function statusBadgeColor(status: string) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'suspended') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700';
}

export default function Team() {
  const access = useAdminAccess();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [creatingLoginId, setCreatingLoginId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [createdLogin, setCreatedLogin] = useState<CreatedLogin | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'company_consultant',
    userId: '',
  });

  async function loadData() {
    setIsLoading(true);
    setSyncError(null);

    try {
      let companyId = access.companyId || selectedCompanyId;

      if (access.isMasterAdmin) {
        const { data: companiesData, error: companiesError } = await supabase
          .from('partner_companies')
          .select('id,name,display_name,slug,status')
          .order('display_name', { ascending: true });

        if (companiesError) throw companiesError;

        setCompanies((companiesData || []) as Company[]);

        if (!companyId && companiesData?.[0]?.id) {
          companyId = companiesData[0].id;
          setSelectedCompanyId(companyId);
        }
      }

      let query = supabase
        .from('partner_company_users')
        .select('id,company_id,user_id,role,status,name,email,phone,created_at')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data || []) as TeamMember[];
      setMembers(rows);

      const nextInputs: Record<string, string> = {};
      rows.forEach((member) => {
        nextInputs[member.id] = member.user_id || '';
      });
      setLinkInputs(nextInputs);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao carregar equipe.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!access.isLoading) {
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access.isLoading, access.companyId, access.isMasterAdmin, selectedCompanyId]);

  const filteredMembers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return members;

    return members.filter((member) => {
      return (
        (member.name || '').toLowerCase().includes(term)
        || (member.email || '').toLowerCase().includes(term)
        || (member.phone || '').toLowerCase().includes(term)
        || roleLabels[member.role]?.toLowerCase().includes(term)
      );
    });
  }, [members, search]);

  const selectedCompany = access.isMasterAdmin
    ? companies.find((company) => company.id === selectedCompanyId)
    : null;

  async function handleCreateMember(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setSyncError(null);
    setSuccessMessage(null);
    setCreatedLogin(null);

    try {
      const companyId = access.isMasterAdmin ? selectedCompanyId : access.companyId;

      if (!companyId) {
        throw new Error('Selecione uma empresa antes de cadastrar o usuário.');
      }

      if (!form.name.trim() || !form.email.trim()) {
        throw new Error('Informe nome e e-mail.');
      }

      if (access.isCompanyManager && form.role !== 'company_consultant') {
        throw new Error('Gestores só podem cadastrar consultores.');
      }

      const { error } = await supabase.from('partner_company_users').insert({
        company_id: companyId,
        user_id: form.userId.trim() || null,
        role: form.role,
        status: form.userId.trim() ? 'active' : 'pending_auth',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });

      if (error) throw error;

      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'company_consultant',
        userId: '',
      });

      setSuccessMessage('Usuário cadastrado com sucesso.');
      await loadData();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao cadastrar usuário.');
    } finally {
      setIsSaving(false);
    }
  }

  async function processLogin(member: TeamMember, action: 'create_login' | 'reset_password') {
    setSyncError(null);
    setSuccessMessage(null);
    setCreatedLogin(null);
    setCreatingLoginId(member.id);

    try {
      if (!member.email) {
        throw new Error('Este usuário não possui e-mail.');
      }

      const { data, error } = await supabase.functions.invoke('create-team-user', {
        body: {
          memberId: member.id,
          action,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCreatedLogin({
        memberId: member.id,
        email: data.email,
        temporaryPassword: data.temporaryPassword,
        userId: data.userId,
        action: data.action || action,
      });

      setSuccessMessage(
        action === 'create_login'
          ? 'Login criado e vinculado com sucesso. Copie a senha temporária antes de sair desta tela.'
          : 'Nova senha temporária gerada com sucesso. Copie a senha antes de sair desta tela.'
      );

      await loadData();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao processar login.');
    } finally {
      setCreatingLoginId(null);
    }
  }

  async function updateMemberStatus(memberId: string, status: string) {
    setSyncError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('partner_company_users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      setSuccessMessage(status === 'active' ? 'Usuário reativado.' : 'Usuário suspenso.');
      await loadData();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao atualizar usuário.');
    }
  }

  async function linkAuthUser(member: TeamMember) {
    setSyncError(null);
    setSuccessMessage(null);

    try {
      const userId = (linkInputs[member.id] || '').trim();

      if (!userId) {
        throw new Error('Cole o user_id do Supabase Auth antes de vincular.');
      }

      const { error } = await supabase
        .from('partner_company_users')
        .update({
          user_id: userId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (error) throw error;

      setSuccessMessage(`${member.name || member.email || 'Usuário'} vinculado ao login com sucesso.`);
      await loadData();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao vincular login.');
    }
  }

  async function copyText(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage(success);
    } catch {
      setSyncError('Não foi possível copiar automaticamente. Copie manualmente.');
    }
  }

  if (!access.isLoading && !access.canManageTeam) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 size-8 text-[var(--text-muted)]" />
          <h1 className="text-xl font-bold text-[var(--deep-blue)]">Acesso restrito</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            A gestão de equipe está disponível para Admin EPSA, Empresa Parceira e Gestor da Empresa.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
            Equipe
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">
            Usuários da Empresa
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Cadastre gestores e consultores, crie login automático e distribua leads.
          </p>
        </div>

        <button
          onClick={() => void loadData()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--medium-gray)] bg-white px-4 py-2 text-sm font-medium text-[var(--graphite)] hover:bg-gray-50"
        >
          <RefreshCw className="size-4" />
          Atualizar
        </button>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {createdLogin && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 font-semibold">{createdLogin.action === 'reset_password' ? 'Nova senha temporária gerada.' : 'Login criado.'} Copie estes dados agora.</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <span className="block text-xs uppercase text-amber-700">E-mail</span>
              <strong>{createdLogin.email}</strong>
            </div>
            <div>
              <span className="block text-xs uppercase text-amber-700">Senha temporária</span>
              <strong>{createdLogin.temporaryPassword}</strong>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => void copyText(`E-mail: ${createdLogin.email}\nSenha temporária: ${createdLogin.temporaryPassword}`, 'Dados de acesso copiados.')}
                className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Copiar acesso
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Fluxo automático:</strong> cadastre a pessoa na equipe e clique em <strong>Criar login</strong>.
        O sistema cria o usuário no Auth, vincula o user_id e libera o acesso.
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleCreateMember} className="rounded-xl border border-[var(--medium-gray)] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--deep-blue)] text-white">
              <UserPlus className="size-4" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--graphite)]">Adicionar usuário</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Cadastre a pessoa na equipe. O login pode ser criado em seguida.
              </p>
            </div>
          </div>

          {access.isMasterAdmin && (
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Empresa
              </span>
              <select
                value={selectedCompanyId}
                onChange={(event) => setSelectedCompanyId(event.target.value)}
                className="w-full rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.display_name || company.name} · {company.slug}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
              Nome
            </span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
              placeholder="Nome do gestor ou consultor"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
              E-mail
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
              placeholder="email@empresa.com.br"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
              WhatsApp
            </span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
              placeholder="(21) 99999-9999"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
              Perfil de acesso
            </span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="w-full rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
            >
              {!access.isCompanyManager && <option value="company_manager">Gestor da Empresa</option>}
              <option value="company_consultant">Consultor da Empresa</option>
              {access.isMasterAdmin && <option value="company_admin">Empresa Parceira / Contratante</option>}
            </select>
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-[var(--deep-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--navy)] disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Cadastrar usuário'}
          </button>
        </form>

        <div className="rounded-xl border border-[var(--medium-gray)] bg-white">
          <div className="border-b border-[var(--medium-gray)] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-semibold text-[var(--graphite)]">
                  <Users className="size-4" />
                  Equipe cadastrada
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {selectedCompany ? `${selectedCompany.display_name || selectedCompany.name} · ${selectedCompany.slug}` : 'Usuários vinculados à empresa.'}
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-[var(--medium-gray)] py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
                  placeholder="Buscar por nome, e-mail ou função"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--medium-gray)]">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1.2fr_auto] xl:items-center">
                  <div>
                    <p className="font-medium text-[var(--graphite)]">{member.name || 'Sem nome'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{member.email || 'Sem e-mail'}</p>
                    {member.phone && <p className="text-xs text-[var(--text-muted)]">{member.phone}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${roleBadgeColor(member.role)}`}>
                      {roleLabels[member.role] || member.role}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeColor(member.status)}`}>
                      {statusLabels[member.status] || member.status}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      member.user_id ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {member.user_id ? 'Vinculado' : 'Sem login'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!member.user_id ? (
                      <button
                        type="button"
                        onClick={() => void processLogin(member, 'create_login')}
                        disabled={creatingLoginId === member.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <KeyRound className="size-3.5" />
                        {creatingLoginId === member.id ? 'Criando...' : 'Criar login'}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => void processLogin(member, 'reset_password')}
                          disabled={creatingLoginId === member.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                        >
                          <KeyRound className="size-3.5" />
                          {creatingLoginId === member.id ? 'Gerando...' : 'Gerar nova senha'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyText(member.user_id || '', 'User ID copiado.')}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-xs font-semibold text-[var(--deep-blue)] hover:bg-gray-50"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Copiar user_id
                        </button>
                      </>
                    )}

                    {member.email && (
                      <button
                        type="button"
                        onClick={() => void copyText(member.email || '', 'E-mail copiado.')}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-xs font-semibold text-[var(--deep-blue)] hover:bg-gray-50"
                      >
                        <Copy className="size-3.5" />
                        Copiar e-mail
                      </button>
                    )}

                    {!member.user_id && (
                      <details className="w-full">
                        <summary className="cursor-pointer text-xs font-semibold text-[var(--deep-blue)]">
                          Vincular manualmente
                        </summary>
                        <div className="mt-2 flex gap-2">
                          <input
                            value={linkInputs[member.id] || ''}
                            onChange={(event) => setLinkInputs((current) => ({ ...current, [member.id]: event.target.value }))}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#C47A21]/30"
                            placeholder="Cole o user_id do Supabase Auth"
                          />
                          <button
                            type="button"
                            onClick={() => void linkAuthUser(member)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[var(--deep-blue)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--navy)]"
                          >
                            <Link2 className="size-3.5" />
                            Vincular
                          </button>
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="xl:text-right">
                    {member.status === 'active' ? (
                      <button
                        onClick={() => void updateMemberStatus(member.id, 'suspended')}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Suspender
                      </button>
                    ) : (
                      <button
                        onClick={() => void updateMemberStatus(member.id, member.user_id ? 'active' : 'pending_auth')}
                        className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                Carregando equipe...
              </div>
            )}

            {!isLoading && filteredMembers.length === 0 && (
              <div className="p-8 text-center">
                <Building2 className="mx-auto mb-3 size-8 text-slate-300" />
                <p className="text-sm text-[var(--text-muted)]">
                  Nenhum usuário encontrado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
