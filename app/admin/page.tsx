import { createServiceClient } from '@/lib/supabase/server';
import GraficoFaturamento from '@/components/admin/GraficoFaturamento';
import MetricCard from '@/components/admin/MetricCard';
import TopProdutos from '@/components/admin/TopProdutos';
import MetodosPagamento from '@/components/admin/MetodosPagamento';
import { fmt } from '@/lib/utils';
import type { MetricasDashboard, FaturamentoDia } from '@/types';

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  // Métricas gerais (via view)
  const { data: metricas } = await supabase
    .from('metricas_dashboard')
    .select('*')
    .single();

  // Faturamento diário nos últimos 7 dias
  const { data: faturamentoDiario } = await supabase.rpc(
    'faturamento_por_dia',
    { dias: 7 }
  );

  // Top 5 produtos mais vendidos
  const { data: topProdutos } = await supabase.rpc('top_produtos', { limite: 5 });

  // Proporção de métodos de pagamento
  const { data: metodosPag } = await supabase.rpc('proporcao_pagamentos');

  const m: MetricasDashboard = metricas ?? {
    faturamento_hoje: 0, pedidos_hoje: 0, faturamento_7d: 0,
    ticket_medio_7d: 0, pendentes: 0, aguardando_pix: 0, preparando: 0, na_entrega: 0,
  };

  const cards = [
    { label: 'Faturamento Hoje',  value: fmt(m.faturamento_hoje), sub: `${m.pedidos_hoje} pedidos`,          icon: '💰', cor: 'forest' },
    { label: 'Receita 7 Dias',    value: fmt(m.faturamento_7d),   sub: 'Seg–Dom',                            icon: '📈', cor: 'forest-mid' },
    { label: 'Ticket Médio',      value: fmt(m.ticket_medio_7d),  sub: 'Últimos 7 dias',                     icon: '🎯', cor: 'wood' },
    { label: 'Fila Agora',        value: String(m.pendentes + m.preparando + m.na_entrega), sub: 'pedidos ativos', icon: '⚡', cor: 'gold' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-forest text-2xl font-bold">Dashboard</h1>
        <p className="text-pinus-text text-sm mt-0.5">Visão geral do faturamento e operação</p>
      </div>

      {/* Métrica cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(c => <MetricCard key={c.label} {...c} />)}
      </div>

      {/* Gráfico + top produtos */}
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 card">
          <h2 className="font-bold text-forest text-sm mb-4">📈 Faturamento — Últimos 7 Dias</h2>
          <GraficoFaturamento dados={(faturamentoDiario ?? []) as FaturamentoDia[]} />
        </div>
        <div className="col-span-2 card">
          <h2 className="font-bold text-forest text-sm mb-4">🏆 Top Produtos</h2>
          <TopProdutos items={(topProdutos ?? []) as { nome: string; total: number }[]} />
        </div>
      </div>

      {/* Métodos de pagamento */}
      <div className="card">
        <h2 className="font-bold text-forest text-sm mb-4">💳 Métodos de Pagamento</h2>
        <MetodosPagamento dados={(metodosPag ?? []) as { metodo: string; pct: number }[]} />
      </div>
    </div>
  );
}
