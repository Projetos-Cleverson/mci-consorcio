import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { useLeadsStore } from '@/stores/leadsStore';

export default function AdminLogin() {
  const navigate = useNavigate();

  const login = useLeadsStore((state) => state.login);
  const isLoading = useLeadsStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Informe o e-mail de acesso.');
      return;
    }

    if (!password.trim()) {
      setError('Informe a senha.');
      return;
    }

    const success = await login(email.trim(), password.trim());

    if (success) {
      navigate('/admin');
      return;
    }

    setError('E-mail ou senha incorretos. Verifique e tente novamente.');
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-5 shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Painel Administrativo
          </h1>

          <p className="text-slate-500 mt-2">
            MCI Consórcio Imobiliário
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            E-mail
          </label>

          <div className="relative mb-4">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="seu@email.com"
              className="w-full h-12 rounded-xl border border-slate-300 pl-10 pr-4 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              autoFocus
            />
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Senha
          </label>

          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="Digite sua senha"
              className="w-full h-12 rounded-xl border border-slate-300 pl-10 pr-4 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Acesso restrito à equipe administrativa.
          </p>
        </form>
      </section>
    </main>
  );
}