import { FormEvent, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Informe e confirme a nova senha.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da senha não confere.');
      return;
    }

    if (currentPassword && currentPassword === newPassword) {
      setErrorMessage('A nova senha precisa ser diferente da senha atual.');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Senha alterada com sucesso. Use a nova senha no próximo acesso.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
            Minha conta
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">
            Alterar senha
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Defina uma nova senha para acessar o painel com segurança.
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-5">
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <div>
              <strong>Recomendação:</strong> após receber a senha temporária, altere para uma senha própria.
              A senha não fica visível para a EPSA nem para a empresa parceira.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Senha atual opcional
              </span>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-[var(--medium-gray)] py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
                  placeholder="Digite sua senha atual, se desejar"
                  autoComplete="current-password"
                />
              </div>
              <span className="mt-1 block text-[11px] text-[var(--text-muted)]">
                Este campo é apenas de referência para o usuário. A troca é feita pela sessão autenticada.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Nova senha
              </span>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-[var(--medium-gray)] py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--deep-blue)]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Confirmar nova senha
              </span>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-[var(--medium-gray)] py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-[var(--deep-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--navy)] disabled:opacity-60"
            >
              {isSaving ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
