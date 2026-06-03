import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldOff,
  XCircle,
  Building2,
  Search,
  Link2,
  Mail,
  KeyRound,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";

type ApplicationStatus = "pending" | "approved" | "rejected";
type CompanyStatus =
  | "active"
  | "pilot"
  | "pending_payment"
  | "suspended"
  | "canceled";

type PartnerApplication = {
  id: string;
  user_id: string | null;
  company_name: string;
  cnpj: string | null;
  responsible_name: string;
  responsible_email: string;
  responsible_phone: string;
  commercial_whatsapp: string;
  city: string | null;
  state: string | null;
  desired_slug: string;
  consultants_count: number | null;
  message: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  approved_company_id: string | null;
  created_at: string;
};

type PartnerCompany = {
  id: string;
  name: string;
  slug: string;
  display_name: string | null;
  commercial_whatsapp: string | null;
  responsible_name: string | null;
  responsible_email: string | null;
  responsible_phone: string | null;
  city: string | null;
  state: string | null;
  status: CompanyStatus;
  plan_type: string | null;
  created_at: string;
  updated_at: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Recusada",
  active: "Ativa",
  pilot: "Piloto",
  pending_payment: "Pagamento pendente",
  suspended: "Suspensa",
  canceled: "Cancelada",
};

const companyStatusClass: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  pilot: "bg-blue-100 text-blue-800",
  pending_payment: "bg-amber-100 text-amber-800",
  suspended: "bg-red-100 text-red-800",
  canceled: "bg-slate-100 text-slate-700",
};

const applicationStatusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatWhatsApp(value?: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function getCompanyStatusHelp(status: CompanyStatus) {
  if (status === "active" || status === "pilot") {
    return "A empresa pode usar o link e acessar o painel com os próprios leads.";
  }
  if (status === "pending_payment") {
    return "A empresa está aguardando confirmação de pagamento. Use reativar quando liberar o acesso.";
  }
  if (status === "suspended") {
    return "A empresa está suspensa. O acesso ao painel e aos leads deve ficar bloqueado.";
  }
  if (status === "canceled") {
    return "A empresa foi cancelada e não deve operar novos leads.";
  }
  return "Status da empresa.";
}

export default function AdminPartners() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [activeTab, setActiveTab] = useState<"applications" | "companies">(
    "applications",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function loadData() {
    setIsLoading(true);
    try {
      const [appsResult, companiesResult] = await Promise.all([
        supabase
          .from("partner_company_applications")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("partner_companies")
          .select(
            "id,name,slug,display_name,commercial_whatsapp,responsible_name,responsible_email,responsible_phone,city,state,status,plan_type,created_at,updated_at",
          )
          .order("created_at", { ascending: false }),
      ]);

      if (appsResult.error) throw appsResult.error;
      if (companiesResult.error) throw companiesResult.error;

      setApplications((appsResult.data || []) as PartnerApplication[]);
      setCompanies((companiesResult.data || []) as PartnerCompany[]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar empresas",
        description:
          error instanceof Error
            ? error.message
            : "Verifique se o SQL foi rodado e se seu usuário é admin.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((item) =>
      [
        item.company_name,
        item.responsible_name,
        item.responsible_email,
        item.desired_slug,
        item.city,
        item.state,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [applications, search]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((item) =>
      [
        item.name,
        item.display_name,
        item.slug,
        item.responsible_name,
        item.responsible_email,
        item.city,
        item.state,
        item.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [companies, search]);

  async function approveApplication(id: string) {
    if (!confirm("Aprovar esta empresa e liberar o acesso ao painel?")) return;

    try {
      const { error } = await supabase.rpc(
        "approve_partner_company_application",
        {
          p_application_id: id,
        },
      );
      if (error) throw error;
      toast({
        title: "Empresa aprovada",
        description: "O link e o acesso ao painel foram liberados.",
      });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  async function rejectApplication(id: string) {
    const notes = window.prompt(
      "Motivo da recusa ou observação interna:",
      "Cadastro recusado manualmente pelo admin EPSA.",
    );
    if (notes === null) return;

    try {
      const { error } = await supabase.rpc(
        "reject_partner_company_application",
        {
          p_application_id: id,
          p_admin_notes: notes,
        },
      );
      if (error) throw error;
      toast({ title: "Solicitação recusada" });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao recusar",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  async function setCompanyStatus(id: string, status: CompanyStatus) {
    const label = statusLabel[status] || status;
    if (!confirm(`Alterar status da empresa para "${label}"?`)) return;

    try {
      const { error } = await supabase.rpc("set_partner_company_status", {
        p_company_id: id,
        p_status: status,
      });
      if (error) throw error;
      toast({
        title: "Status atualizado",
        description: `Empresa marcada como ${label}.`,
      });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  async function copyText(
    text: string,
    message = "Copiado para a área de transferência.",
  ) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: message });
    } catch {
      toast({ variant: "destructive", title: "Não foi possível copiar." });
    }
  }

  const pendingCount = applications.filter(
    (item) => item.status === "pending",
  ).length;
  const activeCount = companies.filter(
    (item) => item.status === "active" || item.status === "pilot",
  ).length;
  const suspendedCount = companies.filter(
    (item) => item.status === "suspended" || item.status === "canceled",
  ).length;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--deep-blue)] font-sans">
              Empresas Parceiras
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Aprove, suspenda e gerencie empresas contratantes do MCI
              Consórcio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--medium-gray)] bg-white text-sm font-medium text-[var(--graphite)] hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[var(--medium-gray)] p-4">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Clock className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Pendentes
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--deep-blue)]">
              {pendingCount}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--medium-gray)] p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <CheckCircle2 className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Ativas
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--deep-blue)]">
              {activeCount}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--medium-gray)] p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <ShieldOff className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Bloqueadas
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--deep-blue)]">
              {suspendedCount}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--medium-gray)] p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === "applications" ? "bg-[var(--deep-blue)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Solicitações
              </button>
              <button
                onClick={() => setActiveTab("companies")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === "companies" ? "bg-[var(--deep-blue)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Empresas aprovadas
              </button>
            </div>

            <div className="relative md:w-80">
              <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar empresa, e-mail ou slug..."
                className="w-full h-10 rounded-lg border border-[var(--medium-gray)] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-accent)]/30"
              />
            </div>
          </div>
        </div>

        {activeTab === "applications" ? (
          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <EmptyState text="Nenhuma solicitação encontrada." />
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-[var(--medium-gray)] p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="font-bold text-[var(--deep-blue)] text-lg">
                          {app.company_name}
                        </h2>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${applicationStatusClass[app.status]}`}
                        >
                          {statusLabel[app.status]}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-[var(--text-muted)]">
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Responsável:
                          </strong>{" "}
                          {app.responsible_name}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            E-mail:
                          </strong>{" "}
                          {app.responsible_email}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            WhatsApp:
                          </strong>{" "}
                          {app.responsible_phone}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Comercial:
                          </strong>{" "}
                          {app.commercial_whatsapp}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Cidade:
                          </strong>{" "}
                          {app.city || "-"}
                          {app.state ? `/${app.state}` : ""}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Consultores:
                          </strong>{" "}
                          {app.consultants_count || 1}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Slug:
                          </strong>{" "}
                          {app.desired_slug}
                        </p>
                        <p>
                          <strong className="text-[var(--graphite)]">
                            Enviado em:
                          </strong>{" "}
                          {formatDate(app.created_at)}
                        </p>
                      </div>
                      {app.message && (
                        <p className="mt-3 text-sm text-[var(--graphite)] bg-slate-50 rounded-lg p-3 border border-slate-100">
                          {app.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap lg:flex-col gap-2 lg:w-48">
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveApplication(app.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="size-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => rejectApplication(app.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100"
                          >
                            <XCircle className="size-4" />
                            Recusar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          copyText(
                            `${baseUrl}/?partner=${app.desired_slug}`,
                            "Link copiado.",
                          )
                        }
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                      >
                        <Copy className="size-4" />
                        Copiar link
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCompanies.length === 0 ? (
              <EmptyState text="Nenhuma empresa aprovada encontrada." />
            ) : (
              filteredCompanies.map((company) => {
                const link = `${baseUrl}/?partner=${company.slug}`;
                const loginUrl = `${baseUrl}/admin/login`;
                const accessEmail = company.responsible_email || "-";
                const isActive =
                  company.status === "active" || company.status === "pilot";
                const isSuspended =
                  company.status === "suspended" ||
                  company.status === "canceled" ||
                  company.status === "pending_payment";

                return (
                  <div
                    key={company.id}
                    className="bg-white rounded-2xl border border-[var(--medium-gray)] overflow-hidden shadow-sm"
                  >
                    <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="font-bold text-[var(--deep-blue)] text-xl font-display">
                            {company.display_name || company.name}
                          </h2>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${companyStatusClass[company.status] || "bg-slate-100 text-slate-700"}`}
                          >
                            {statusLabel[company.status] || company.status}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--text-muted)] max-w-2xl">
                          {getCompanyStatusHelp(company.status)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          onClick={() =>
                            copyText(link, "Link da empresa copiado.")
                          }
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                        >
                          <Copy className="size-4" />
                          Copiar link
                        </button>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                        >
                          <ExternalLink className="size-4" />
                          Abrir link
                        </a>
                      </div>
                    </div>

                    <div className="p-5 grid lg:grid-cols-[1.2fr_1fr_260px] gap-5 items-start">
                      <div className="space-y-3">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            <Link2 className="size-4" />
                            Link exclusivo da empresa
                          </div>
                          <p className="text-sm font-semibold text-[var(--deep-blue)] break-all">
                            {link}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Todos os leads gerados por esse link entram
                            vinculados ao slug <strong>{company.slug}</strong>.
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            <KeyRound className="size-4" />
                            Acesso ao painel
                          </div>
                          <div className="space-y-1 text-sm text-[var(--text-muted)]">
                            <p>
                              <strong className="text-[var(--graphite)]">
                                Painel:
                              </strong>{" "}
                              <span className="break-all">{loginUrl}</span>
                            </p>
                            <p>
                              <strong className="text-[var(--graphite)]">
                                E-mail de acesso:
                              </strong>{" "}
                              {accessEmail}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() =>
                                copyText(
                                  `Painel: ${loginUrl}\nE-mail: ${accessEmail}\nLink do diagnóstico: ${link}`,
                                  "Dados de acesso copiados.",
                                )
                              }
                              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                            >
                              <Copy className="size-3" />
                              Copiar dados de acesso
                            </button>
                            <a
                              href={loginUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                            >
                              <ExternalLink className="size-3" />
                              Abrir painel
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-4 bg-white">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                          Dados comerciais
                        </div>
                        <div className="space-y-2 text-sm text-[var(--text-muted)]">
                          <p>
                            <strong className="text-[var(--graphite)]">
                              Responsável:
                            </strong>{" "}
                            {company.responsible_name || "-"}
                          </p>
                          <p className="flex items-start gap-1.5">
                            <Mail className="size-4 mt-0.5 text-slate-400" />
                            <span>
                              <strong className="text-[var(--graphite)]">
                                E-mail:
                              </strong>{" "}
                              {company.responsible_email || "-"}
                            </span>
                          </p>
                          <p>
                            <strong className="text-[var(--graphite)]">
                              WhatsApp:
                            </strong>{" "}
                            {formatWhatsApp(
                              company.commercial_whatsapp ||
                                company.responsible_phone,
                            )}
                          </p>
                          <p>
                            <strong className="text-[var(--graphite)]">
                              Cidade:
                            </strong>{" "}
                            {company.city || "-"}
                            {company.state ? `/${company.state}` : ""}
                          </p>
                          <p>
                            <strong className="text-[var(--graphite)]">
                              Plano:
                            </strong>{" "}
                            {company.plan_type || "-"}
                          </p>
                          <p>
                            <strong className="text-[var(--graphite)]">
                              Criada em:
                            </strong>{" "}
                            {formatDate(company.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                          Gestão de acesso
                        </div>

                        <div className="space-y-2">
                          {!isActive && (
                            <button
                              onClick={() =>
                                setCompanyStatus(company.id, "active")
                              }
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
                            >
                              <Power className="size-4" />
                              Reativar acesso
                            </button>
                          )}

                          {company.status !== "suspended" && (
                            <button
                              onClick={() =>
                                setCompanyStatus(company.id, "suspended")
                              }
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-bold hover:bg-red-100"
                            >
                              <PowerOff className="size-4" />
                              Suspender acesso
                            </button>
                          )}

                          {company.status !== "pending_payment" && (
                            <button
                              onClick={() =>
                                setCompanyStatus(company.id, "pending_payment")
                              }
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold hover:bg-amber-100"
                            >
                              <AlertTriangle className="size-4" />
                              Pagamento pendente
                            </button>
                          )}
                        </div>

                        <div
                          className={`mt-4 rounded-lg p-3 text-xs leading-relaxed ${isSuspended ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"}`}
                        >
                          {isSuspended
                            ? "Com esse status, a empresa deve ficar impedida de acessar os próprios leads até regularização."
                            : "Empresa liberada para usar o link e acessar o painel com seus leads."}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--medium-gray)] p-12 text-center">
      <Building2 className="size-10 mx-auto text-slate-300 mb-3" />
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  );
}
