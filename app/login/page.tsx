'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.');
    } else {
      router.push('/admin');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-serif text-gold-light text-4xl font-black tracking-wide mb-1">🌲</div>
          <div className="font-serif text-gold-light text-3xl font-black tracking-wide">PINUS BAR</div>
          <div className="text-forest-light text-xs tracking-widest mt-1">PAINEL ADMINISTRATIVO</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-cream rounded-2xl p-6 shadow-lg space-y-4">
          <h1 className="font-bold text-forest text-lg text-center mb-2">Entrar no Painel</h1>

          <div>
            <label className="block text-xs font-semibold text-pinus-text mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@pinusbar.com.br"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pinus-text mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          {erro && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 border border-red-200">
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-forest-light/60 text-xs mt-6">
          © {new Date().getFullYear()} Pinus Bar — Acesso restrito
        </p>
      </div>
    </div>
  );
}
