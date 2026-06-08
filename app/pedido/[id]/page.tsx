import { createClient } from '@/lib/supabase/server';
import { STATUS_LABEL } from '@/types';
import { fmt, shortId, fmtDataHora } from '@/lib/utils';
import type { Pedido } from '@/types';

export default async function PedidoStatusPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!pedido) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-serif text-forest text-xl font-bold mb-2">Pedido não encontrado</h1>
          <p className="text-wood text-sm">Verifique o link enviado no WhatsApp.</p>
        </div>
      </div>
    );
  }

  const p = pedido as Pedido;

  const steps = [
    { key: 'pendente',     label: 'Pedido Recebido',   icon: '🔔' },
    { key: 'preparando',   label: 'Preparando',        icon: '👨‍🍳' },
    { key: 'saiu_entrega', label: 'Saiu para Entrega', icon: '🛵' },
    { key: 'entregue',     label: 'Entregue',          icon: '✅' },
  ];

  const stepIdx = steps.findIndex(s => s.key === p.status);
  const progresso = Math.min(Math.max(stepIdx, 0), steps.length - 1);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream pb-10">
      {/* Header */}
      <div className="bg-forest px-5 pt-6 pb-5">
        <div className="font-serif text-gold-light text-xl font-black tracking-wide mb-0.5">🌲 PINUS BAR</div>
        <div className="text-forest-light text-xs tracking-widest">STATUS DO PEDIDO</div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* ID + status */}
        <div className="card flex items-center justify-between">
          <div>
            <div className="font-bold text-forest text-lg">{shortId(p.id)}</div>
            <div className="text-xs text-pinus-text mt-0.5">{fmtDataHora(p.created_at)}</div>
          </div>
          <span className="badge bg-forest-light/20 text-forest font-bold">
            {STATUS_LABEL[p.status]}
          </span>
        </div>

        {/* Progress tracker */}
        {p.status !== 'cancelado' && (
          <div className="card">
            <h2 className="font-bold text-forest mb-4 text-sm">Acompanhe seu pedido</h2>
            <div className="space-y-3">
              {steps.map((step, i) => {
                const done    = i < progresso;
                const current = i === progresso;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 transition-all ${
                      done    ? 'bg-forest border-forest text-white' :
                      current ? 'bg-gold border-gold-light text-bark animate-pulse2' :
                                'bg-cream-dark border-cream-dark text-pinus-text'
                    }`}>
                      {step.icon}
                    </div>
                    <div className={`text-sm font-semibold ${current ? 'text-forest' : done ? 'text-forest-mid' : 'text-pinus-text'}`}>
                      {step.label}
                    </div>
                    {current && (
                      <span className="ml-auto text-xs text-gold font-bold animate-pulse">
                        Agora
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Itens */}
        <div className="card">
          <h2 className="font-bold text-forest mb-3 text-sm">Itens do Pedido</h2>
          {p.itens.map((item, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-cream-dark last:border-0 text-sm">
              <span className="text-wood">{item.nome} ×{item.quantidade}</span>
              <span className="font-semibold text-forest">{fmt(item.preco_unitario * item.quantidade)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1 border-t-2 border-cream-dark">
            <span className="font-bold text-forest">Total</span>
            <span className="font-serif font-bold text-forest text-lg">{fmt(p.total_geral)}</span>
          </div>
        </div>

        {/* Endereço */}
        <div className="card text-sm text-wood">
          <div className="font-bold text-forest mb-1.5">📍 Endereço de Entrega</div>
          <div>{p.endereco_entrega.rua}, {p.endereco_entrega.numero}
            {p.endereco_entrega.complemento && `, ${p.endereco_entrega.complemento}`}
          </div>
          <div className="font-semibold mt-0.5">{p.endereco_entrega.bairro}</div>
        </div>
      </div>
    </div>
  );
}
