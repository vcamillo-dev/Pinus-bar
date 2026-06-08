'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Pedido, StatusPedido } from '@/types';

const ACTIVE_STATUSES: StatusPedido[] = ['pendente', 'aguardando_pix', 'preparando', 'saiu_entrega'];

export function usePedidosRealtime() {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const supabase = createClient();

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (err) { setError(err.message); }
    else     { setPedidos((data ?? []) as Pedido[]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        ({ eventType, new: novo, old }) => {
          if (eventType === 'INSERT') {
            setPedidos(prev => [novo as Pedido, ...prev]);
            // Som de notificação para novo pedido
            try { new Audio('/sounds/novo-pedido.mp3').play(); } catch {}
          }
          if (eventType === 'UPDATE') {
            setPedidos(prev =>
              prev.map(p => p.id === (novo as Pedido).id ? (novo as Pedido) : p)
            );
          }
          if (eventType === 'DELETE') {
            setPedidos(prev => prev.filter(p => p.id !== (old as Pedido).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Filtros por status
  const porStatus = (status: StatusPedido) =>
    pedidos.filter(p => p.status === status);

  const ativos = pedidos.filter(p => ACTIVE_STATUSES.includes(p.status));

  return { pedidos, ativos, porStatus, loading, error, recarregar: carregar };
}
