import { createServiceClient } from '@/lib/supabase/server';
import KanbanBoard from '@/components/admin/KanbanBoard';
import type { Pedido } from '@/types';

// Não cachear — a página usa realtime; carga inicial sempre fresca
export const revalidate = 0;

export default async function PedidosPage() {
  const supabase = createServiceClient();

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(150);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-forest text-2xl font-bold">Pedidos</h1>
          <p className="text-pinus-text text-sm mt-0.5">Atualização em tempo real via Supabase Realtime</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-mid font-semibold">
          <span className="w-2 h-2 rounded-full bg-forest-light animate-pulse inline-block" />
          AO VIVO
        </div>
      </div>

      <KanbanBoard pedidosIniciais={(pedidos ?? []) as Pedido[]} />
    </div>
  );
}
