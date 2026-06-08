'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrinho } from '@/context/CarrinhoContext';
import { useRestauranteStatus } from '@/hooks/useRestauranteStatus';
import ProdutoCard from './ProdutoCard';
import CarrinhoDrawer from './CarrinhoDrawer';
import type { Produto, Categoria, Configuracoes } from '@/types';
import { fmt } from '@/lib/utils';

interface Props {
  produtos:      Produto[];
  categorias:    Categoria[];
  configInicial: Configuracoes;
}

export default function CardapioClient({ produtos, categorias, configInicial }: Props) {
  const router  = useRouter();
  const { items, totalItens, subtotal } = useCarrinho();

  // Usar realtime para o status do restaurante
  const { aberto, config } = useRestauranteStatus();
  const estaAberto = config ? config.restaurante_aberto : configInicial.restaurante_aberto;

  const [catAtiva,    setCatAtiva]    = useState(categorias[0]?.slug ?? 'almoco');
  const [drawerAberto, setDrawerAberto] = useState(false);

  const produtosFiltrados = produtos.filter(
    p => p.categoria?.slug === catAtiva
  );

  return (
    <div className="max-w-md mx-auto bg-cream min-h-screen relative">

      {/* ── Header ── */}
      <div className="bg-forest px-[18px] pt-[14px] pb-[10px] sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-serif text-gold-light text-[21px] font-black tracking-wide leading-tight">
              🌲 PINUS BAR
            </div>
            <div className="text-forest-light text-[10px] tracking-[2.5px]">CAMOBI · SANTA MARIA–RS</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${estaAberto ? 'bg-forest-light' : 'bg-red-500'}`}>
              {estaAberto ? '● ABERTO' : '● FECHADO'}
            </div>
            <button
              onClick={() => setDrawerAberto(true)}
              className="relative bg-gold text-bark rounded-[10px] p-2"
              aria-label="Abrir carrinho"
            >
              <span className="text-lg leading-none">🛒</span>
              {totalItens > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-forest text-gold-light rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5">
          {categorias.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setCatAtiva(cat.slug)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold tracking-tight transition-all ${
                catAtiva === cat.slug
                  ? 'bg-gold text-bark'
                  : 'bg-white/10 text-forest-light/90'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mensagem fechado ── */}
      {!estaAberto && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
          🔴 {config?.mensagem_fechado ?? 'Restaurante fechado no momento. Volte em breve!'}
        </div>
      )}

      {/* ── Product list ── */}
      <div className="px-3.5 pt-3 pb-28 space-y-2.5">
        {produtosFiltrados.length === 0 && (
          <div className="text-center text-pinus-text py-12 text-sm">
            Nenhum item nesta categoria.
          </div>
        )}
        {produtosFiltrados.map((produto, i) => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            index={i}
          />
        ))}
      </div>

      {/* ── Floating cart bar ── */}
      {totalItens > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-28px)] max-w-[452px] z-20">
          <button
            onClick={() => {
              if (!estaAberto) return;
              router.push('/checkout');
            }}
            className={`w-full rounded-2xl px-5 py-4 font-bold text-[14px] flex justify-between items-center shadow-xl transition-all ${
              estaAberto ? 'bg-gold text-bark active:scale-[0.98]' : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            <span>🛒 {totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
            <span>{estaAberto ? 'Ir para Checkout →' : '🔴 Fechado'}</span>
            <span className="font-serif font-bold">{fmt(subtotal)}</span>
          </button>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      <CarrinhoDrawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        onCheckout={() => { setDrawerAberto(false); router.push('/checkout'); }}
        restauranteAberto={estaAberto}
      />
    </div>
  );
}
