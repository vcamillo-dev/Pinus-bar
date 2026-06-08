'use client';

import { useCarrinho } from '@/context/CarrinhoContext';
import { fmt } from '@/lib/utils';

interface Props {
  aberto:            boolean;
  onFechar:          () => void;
  onCheckout:        () => void;
  restauranteAberto: boolean;
}

export default function CarrinhoDrawer({ aberto, onFechar, onCheckout, restauranteAberto }: Props) {
  const { items, subtotal, addItem, decItem, removeItem } = useCarrinho();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onFechar}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-cream animate-slideIn flex flex-col">
        {/* Header */}
        <div className="bg-forest px-[18px] py-[14px] flex items-center justify-between">
          <span className="font-serif text-gold-light text-lg font-bold">🛒 Seu Pedido</span>
          <button
            onClick={onFechar}
            className="bg-white/20 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto px-3.5 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-pinus-text text-sm py-12">
              <span className="text-4xl mb-3">🛒</span>
              <span className="font-semibold">Carrinho vazio</span>
              <span className="text-xs mt-1">Adicione itens do cardápio</span>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 py-2.5 border-b border-cream-dark"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[12px] text-forest truncate">{item.nome}</div>
                    <div className="text-[11px] text-wood">{fmt(item.preco)}</div>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => decItem(item.id)}
                      className="bg-cream-dark text-bark rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm leading-none"
                    >
                      −
                    </button>
                    <span className="font-bold text-[13px] text-bark min-w-[18px] text-center">{item.qty}</span>
                    <button
                      onClick={() => addItem({ id: item.id, nome: item.nome, preco: item.preco, imagem_url: item.imagem_url } as any)}
                      className="bg-gold text-bark rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm leading-none"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-[12px] font-bold text-forest min-w-[50px] text-right">
                    {fmt(item.preco * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-3.5 py-4 border-t border-cream-dark space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-wood font-semibold text-[13px]">Subtotal</span>
              <span className="font-serif font-bold text-forest text-lg">{fmt(subtotal)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={!restauranteAberto}
              className="btn-gold w-full"
            >
              {restauranteAberto ? 'Ir para Checkout →' : '🔴 Restaurante Fechado'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
