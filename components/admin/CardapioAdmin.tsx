'use client';

import { useState, useOptimistic, useTransition } from 'react';
import type { Produto, Categoria } from '@/types';
import { fmt } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Props {
  produtos:   Produto[];
  categorias: Categoria[];
}

export default function CardapioAdmin({ produtos: inicial, categorias }: Props) {
  const supabase = createClient();
  const [produtos, setProdutos] = useState(inicial);
  const [isPending, startTransition] = useTransition();

  async function toggleDisponivel(produto: Produto) {
    const novo = !produto.disponivel;

    // Atualização otimista imediata na UI
    setProdutos(prev =>
      prev.map(p => p.id === produto.id ? { ...p, disponivel: novo } : p)
    );

    const { error } = await supabase
      .from('produtos')
      .update({ disponivel: novo })
      .eq('id', produto.id);

    // Reverter em caso de erro
    if (error) {
      setProdutos(prev =>
        prev.map(p => p.id === produto.id ? { ...p, disponivel: produto.disponivel } : p)
      );
    }
  }

  return (
    <div className="space-y-6">
      {categorias.map(cat => {
        const itensCat = produtos.filter(p => p.categoria_id === cat.id);
        const pausados  = itensCat.filter(p => !p.disponivel).length;

        return (
          <div key={cat.id}>
            {/* Cabeçalho da categoria */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-cream-dark">
              <h2 className="font-bold text-forest text-[15px]">{cat.nome}</h2>
              {pausados > 0 && (
                <span className="badge bg-red-100 text-red-700">
                  {pausados} pausado{pausados > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {itensCat.map(p => (
                <ProdutoRow
                  key={p.id}
                  produto={p}
                  onToggle={() => toggleDisponivel(p)}
                />
              ))}

              {itensCat.length === 0 && (
                <div className="col-span-2 text-pinus-text text-sm py-4 text-center">
                  Nenhum produto nesta categoria.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProdutoRow({
  produto,
  onToggle,
}: {
  produto:  Produto;
  onToggle: () => void;
}) {
  return (
    <div
      className={`card flex items-center gap-3 transition-opacity ${
        produto.disponivel ? 'opacity-100' : 'opacity-60'
      }`}
    >
      {/* Emoji / imagem placeholder */}
      <div className="w-10 h-10 rounded-lg bg-pinus-bg flex items-center justify-center text-2xl flex-shrink-0">
        🍽
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[12px] text-forest truncate">{produto.nome}</div>
        <div className="font-serif font-bold text-[13px] text-wood">{fmt(produto.preco)}</div>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold border transition-all active:scale-95 ${
          produto.disponivel
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-red-50   text-red-700   border-red-200   hover:bg-red-100'
        }`}
        title={produto.disponivel ? 'Clique para pausar' : 'Clique para ativar'}
      >
        {produto.disponivel ? '✓ Ativo' : '✗ Pausado'}
      </button>
    </div>
  );
}
