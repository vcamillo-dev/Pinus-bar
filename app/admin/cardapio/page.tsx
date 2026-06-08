import { createServiceClient } from '@/lib/supabase/server';
import CardapioAdmin from '@/components/admin/CardapioAdmin';
import type { Produto, Categoria } from '@/types';

export const revalidate = 0;

export default async function CardapioAdminPage() {
  const supabase = createServiceClient();

  const [{ data: produtos }, { data: categorias }] = await Promise.all([
    supabase
      .from('produtos')
      .select('*, categoria:categorias(id,slug,nome,ordem,ativo)')
      .order('ordem'),
    supabase
      .from('categorias')
      .select('*')
      .eq('ativo', true)
      .order('ordem'),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-forest text-2xl font-bold">Cardápio</h1>
        <p className="text-pinus-text text-sm mt-0.5">
          Pause itens cujos ingredientes acabaram — a mudança reflete imediatamente no app do cliente.
        </p>
      </div>

      <CardapioAdmin
        produtos={(produtos ?? []) as Produto[]}
        categorias={(categorias ?? []) as Categoria[]}
      />
    </div>
  );
}
