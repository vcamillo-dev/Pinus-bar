'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Configuracoes } from '@/types';

export function useRestauranteStatus() {
  const [config,  setConfig]  = useState<Configuracoes | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // Carga inicial
    supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setConfig(data as Configuracoes);
        setLoading(false);
      });

    // Subscription em tempo real — admin altera o switch e o cliente vê imediatamente
    const channel = supabase
      .channel('config-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'configuracoes', filter: 'id=eq.1' },
        ({ new: nova }) => setConfig(nova as Configuracoes)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { config, loading, aberto: config?.restaurante_aberto ?? true };
}
