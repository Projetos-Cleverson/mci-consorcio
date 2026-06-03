import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_ADMIN_KEY = "mci_consorcio_admin_session";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate("/admin", { replace: true });
        return;
      }

      if (localStorage.getItem(LOCAL_ADMIN_KEY) === "true") {
        navigate("/admin", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso.");
        navigate("/admin", { replace: true });
        return;
      }

      if (!ADMIN_PASSWORD) {
        toast.error("Configure VITE_ADMIN_PASSWORD no .env.local para proteger o admin local.");
        return;
      }

      if (password !== ADMIN_PASSWORD) {
        toast.error("Senha inválida.");
        return;
      }

      localStorage.setItem(LOCAL_ADMIN_KEY, "true");
      toast.success("Acesso liberado.");
      navigate("/admin", { replace: true });
    } catch (error: any) {
      console.error(error);
      toast.error("Não foi possível entrar. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--deep-blue)] flex items-center justify-center text-white mb-5 shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--deep-blue)] font-body">
            Painel Administrativo
          </h1>

          <p className="text-slate-500 mt-2">
            MCI Consórcio Imobiliário
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
        >
          {isSupabaseConfigured && (
            <>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>

              <div className="relative mb-4">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-12 rounded-xl border border-slate-300 !pl-11 !pr-4 text-slate-900 outline-none focus:border-[var(--deep-blue)] focus:ring-2 focus:ring-[var(--deep-blue)]/10"
                  autoFocus
                  required
                />
              </div>
            </>
          )}

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Senha
          </label>

          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="w-full h-12 rounded-xl border border-slate-300 !pl-11 !pr-11 text-slate-900 outline-none focus:border-[var(--deep-blue)] focus:ring-2 focus:ring-[var(--deep-blue)]/10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-5 rounded-xl bg-[var(--deep-blue)] text-white font-semibold hover:bg-[var(--navy)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 flex gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--green-accent)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              O painel contém dados pessoais dos leads. Use apenas contas autorizadas e mantenha as credenciais protegidas.
            </p>
          </div>
        </form>

        <p className="text-xs text-slate-400 text-center mt-5">
          Produto do ecossistema MCI · Universidade EPSA
        </p>
      </section>
    </main>
  );
}
