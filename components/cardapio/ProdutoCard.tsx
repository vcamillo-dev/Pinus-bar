'use client';

import Image from 'next/image';
import { useCarrinho } from '@/context/CarrinhoContext';
import type { Produto } from '@/types';
import { fmt } from '@/lib/utils';

interface Props {
  produto: Produto;
  index:   number;
}

export default function ProdutoCard({ produto, index }: Props) {
  const { addItem, decItem, getQty } = useCarrinho();
  const qty = getQty(produto.id);

  return (
    <div
      className={`bg-white rounded-xl p-3.5 border border-cream-dark flex items-center gap-3
        animate-fadeUp transition-opacity ${!produto.disponivel ? 'opacity-55' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Imagem ou emoji fallback */}
      <div className="w-[52px] h-[52px] rounded-lg overflow-hidden flex-shrink-0 bg-pinus-bg flex items-center justify-center">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            width={52}
            height={52}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-3xl">🍽</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[13px] text-forest leading-snug mb-0.5">{produto.nome}</div>
        {produto.descricao && (
          <div className="text-[11px] text-wood leading-[1.4] mb-1.5 line-clamp-2">{produto.descricao}</div>
        )}
        <div className="font-serif font-bold text-forest text-[15px]">{fmt(produto.preco)}</div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0">
        {!produto.disponivel ? (
          <span className="bg-pinus-bg text-pinus-text rounded-md px-2 py-1 text-[10px] font-semibold">
            Esgotado
          </span>
        ) : qty > 0 ? (
          <div className="flex items-center gap-2 bg-green-50 rounded-full px-2.5 py-1 border-[1.5px] border-forest-light">
            <button
              onClick={() => decItem(produto.id)}
              className="text-forest font-bold text-base leading-none w-5 h-5 flex items-center justify-center"
              aria-label="Remover"
            >
              −
            </button>
            <span className="text-[13px] font-bold text-forest min-w-[16px] text-center">{qty}</span>
            <button
              onClick={() => addItem(produto)}
              className="text-gold font-bold text-base leading-none w-5 h-5 flex items-center justify-center"
              aria-label="Adicionar"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(produto)}
            className="bg-gold text-bark rounded-full px-3 py-1.5 text-[11px] font-bold active:scale-95 transition-transform"
          >
            + Adicionar
          </button>
        )}
      </div>
    </div>
  );
}
