'use client';

import { useState } from 'react';
import { usePedidosRealtime } from '@/hooks/usePedidosRealtime';
import type { Pedido, StatusPedido } from '@/types';
import { STATUS_LABEL, NEXT_STATUS, NEXT_STATUS_LABEL } from '@/types';
import { fmt, shortId, fmtDataHora, tempoAtras } from '@/lib/utils';

interface Props {
  pedidosIniciais: Pedido[];
}

const COLS: { id: StatusPedido; cor: string; bg: string }[] = [
  { id: 'pendente',     cor: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200' },
  { id: 'preparando',   cor: 'text-green-700',  bg: 'bg-green-50  border-green-200' },
  { id: 'saiu_entrega', cor: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200'  },
  { id: 'entregue',     cor: 'text-gray-500',   bg: 'bg-gray-50   border-gray-200'  },
];

export default function KanbanBoard({ pedidosIniciais }: Props) {
  const { pedidos } = usePedidosRealtime();
  const [atualizando, setAtualizando] = useState<Set<string>>(new Set());

  // Preferir dados do realtime; usar iniciais no primeiro render
  const lista = pedidos.length > 0 ? pedidos : pedidosIniciais;

  async function avancarStatus(pedido: Pedido) {
    const proximo = NEXT_STATUS[pedido.status];
    if (!proximo) return;

    setAtualizando(s => new Set(s).add(pedido.id));
    try {
      await fetch(`/api/pedidos/${pedido.id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: proximo }),
      });
    } finally {
      setAtualizando(s => { const n = new Set(s); n.delete(pedido.id); return n; });
    }
  }

  return (
    <div className="grid grid-cols-4 gap-3 h-[calc(100vh-160px)]">
      {COLS.map(col => {
        const colPedidos = lista.filter(p => p.status === col.id);
        return (
          <div key={col.id} className={`rounded-xl border p-2.5 flex flex-col overflow-hidden ${col.bg}`}>
            {/* Column header */}
            <div className={`flex items-center justify-between mb-2.5 ${col.cor}`}>
              <span className="font-bold text-[12px]">{STATUS_LABEL[col.id]}</span>
              <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shadow-sm">
                {colPedidos.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {colPedidos.length === 0 && (
                <div className="text-center text-gray-400 text-xs py-5">Nenhum pedido</div>
              )}
              {colPedidos.map(p => (
                <PedidoCard
                  key={p.id}
                  pedido={p}
                  onAvancar={() => avancarStatus(p)}
                  carregando={atualizando.has(p.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PedidoCard({
  pedido,
  onAvancar,
  carregando,
}: {
  pedido:     Pedido;
  onAvancar:  () => void;
  carregando: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const proximo = NEXT_STATUS[pedido.status];

  return (
    <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-forest text-[12px]">{shortId(pedido.id)}</span>
        <span className="text-[9px] text-gray-400 bg-gray-50 rounded px-1.5 py-0.5">
          {tempoAtras(pedido.created_at)}
        </span>
      </div>

      <div className="font-semibold text-[11px] text-bark mb-1">{pedido.nome_cliente}</div>

      {/* Itens (clicável para expandir) */}
      <button
        onClick={() => setExpandido(e => !e)}
        className="w-full text-left text-[10px] text-wood mb-2 leading-relaxed hover:text-forest transition-colors"
      >
        {expandido
          ? pedido.itens.map(i => `${i.nome} ×${i.quantidade}`).join('\n')
          : pedido.itens.map(i => `${i.nome} ×${i.quantidade}`).join(', ')}
        {!expandido && pedido.itens.length > 2 && ' ...'}
      </button>

      {expandido && (
        <div className="text-[9px] text-gray-400 mb-2">
          📍 {pedido.endereco_entrega.rua}, {pedido.endereco_entrega.numero} — {pedido.endereco_entrega.bairro}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif font-bold text-forest text-[13px]">{fmt(pedido.total_geral)}</div>
          <div className="text-[9px] text-pinus-text">
            {pedido.forma_pagamento === 'pix' ? '✅ Pix' : '💳 Cartão'}
          </div>
        </div>

        {proximo && (
          <button
            onClick={onAvancar}
            disabled={carregando}
            className="bg-gold text-bark text-[9px] font-bold rounded-lg px-2 py-1.5 disabled:opacity-50 hover:bg-gold-light transition-colors active:scale-95"
          >
            {carregando ? '...' : NEXT_STATUS_LABEL[pedido.status]}
          </button>
        )}
      </div>
    </div>
  );
}
