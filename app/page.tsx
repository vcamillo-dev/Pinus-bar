import { createClient } from '@/lib/supabase/server';
import CardapioClient from '@/components/cardapio/CardapioClient';
import type { Produto, Categoria, Configuracoes } from '@/types';

// Revalidar a cada 60 segundos (ISR)
export const revalidate = 60;

export default async function CardapioPage() {
  const supabase = createClient();

  // Buscar tudo em paralelo
  const [{ data: produtos }, { data: categorias }, { data: config }] =
    await Promise.all([
      supabase
        .from('produtos')
        .select('*, categoria:categorias(id,slug,nome,ordem,ativo)')
        .order('ordem'),
      supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single(),
    ]);

  return (
    <CardapioClient
      produtos={(produtos ?? []) as Produto[]}
      categorias={(categorias ?? []) as Categoria[]}
      configInicial={(config ?? { restaurante_aberto: true }) as Configuracoes}
    />
  );
}
