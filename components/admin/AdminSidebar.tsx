'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Props {
  userEmail:         string;
  restauranteAberto: boolean;
}

const NAV = [
  { href: '/admin',          label: 'Dashboard',    icon: '📊' },
  { href: '/admin/pedidos',  label: 'Pedidos',      icon: '📋' },
  { href: '/admin/cardapio', label: 'Cardápio',     icon: '🍽️' },
];

export default function AdminSidebar({ userEmail, restauranteAberto: initialAberto }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const [aberto,   setAberto]   = useState(initialAberto);
  const [toggling, setToggling] = useState(false);

  async function toggleRestaurante() {
    setToggling(true);
    const novo = !aberto;
    const { error } = await supabase
      .from('configuracoes')
      .update({ restaurante_aberto: novo })
      .eq('id', 1);

    if (!error) setAberto(novo);
    setToggling(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-[210px] bg-forest flex flex-col py-[18px] px-2.5 flex-shrink-0">
      {/* Brand */}
      <div className="px-2 mb-5">
        <div className="font-serif text-gold-light text-[17px] font-bold leading-tight">🌲 PINUS BAR</div>
        <div className="text-forest-light/70 text-[9px] tracking-[2px] mt-0.5">PAINEL ADMIN</div>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all',
              pathname === item.href
                ? 'bg-gold/18 text-gold-light border border-gold/35 font-bold'
                : 'text-forest-light hover:bg-white/10 border border-transparent'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Restaurant toggle */}
      <div className="bg-black/20 rounded-xl p-3 mb-3">
        <div className="text-forest-light/60 text-[9px] font-bold tracking-[1.5px] mb-2">
          RESTAURANTE
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[12px] font-bold ${aberto ? 'text-forest-light' : 'text-red-400'}`}>
            {aberto ? '🟢 Aberto' : '🔴 Fechado'}
          </span>
          <button
            onClick={toggleRestaurante}
            disabled={toggling}
            className={`text-white text-[10px] font-bold rounded-full px-2.5 py-1 transition-all disabled:opacity-60 ${
              aberto ? 'bg-red-500 hover:bg-red-600' : 'bg-forest-light hover:bg-forest-light/80'
            }`}
          >
            {toggling ? '...' : aberto ? 'Fechar' : 'Abrir'}
          </button>
        </div>
      </div>

      {/* User */}
      <div className="border-t border-white/10 pt-3 px-1">
        <div className="text-forest-light/60 text-[10px] truncate mb-1.5">{userEmail}</div>
        <button
          onClick={handleLogout}
          className="text-forest-light/70 hover:text-red-400 text-[11px] transition-colors"
        >
          → Sair
        </button>
      </div>
    </aside>
  );
}
