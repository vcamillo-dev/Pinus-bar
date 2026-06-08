'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrinho } from '@/context/CarrinhoContext';
import FormCheckout from '@/components/checkout/FormCheckout';
import PixPayment from '@/components/checkout/PixPayment';
import type { CriarPedidoResponse, FormCheckoutData } from '@/types';
import { fmt, shortId } from '@/lib/utils';

type Screen = 'form' | 'pix' | 'sucesso';

export default function CheckoutPage() {
  const router   = useRouter();
  const carrinho = useCarrinho();

  const [screen,   setScreen]   = useState<Screen>('form');
  const [loading,  setLoading]  = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string>('');
  const [pixData,  setPixData]  = useState<Pick<CriarPedidoResponse,'pix_copia_cola'|'pix_location'|'pix_imagem'> | null>(null);
  const [totalGeral, setTotalGeral] = useState(0);

  if (carrinho.items.length === 0 && screen === 'form') {
    router.replace('/');
    return null;
  }

  async function handleConfirmar(form: FormCheckoutData) {
    setLoading(true);
    setErro(null);

    const total = carrinho.subtotal + form.bairro.taxa;
    setTotalGeral(total);

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_cliente:     form.nome,
          telefone_cliente: form.telefone,
          itens: carrinho.items.map(i => ({
            produto_id:     i.id,
            nome:           i.nome,
            preco_unitario: i.preco,
            quantidade:     i.qty,
          })),
          total_produtos:  carrinho.subtotal,
          taxa_entrega:    form.bairro.taxa,
          endereco_entrega: {
            bairro:       form.bairro.nome,
            rua:          form.rua,
            numero:       form.numero,
            complemento:  form.complemento,
          },
          forma_pagamento: form.forma_pagamento,
        }),
      });

      const data: CriarPedidoResponse = await res.json();
      if (!res.ok) throw new Error((data as any).error ?? 'Erro ao criar pedido');

      setPedidoId(data.pedido_id);

      if (form.forma_pagamento === 'pix') {
        setPixData({
          pix_copia_cola: data.pix_copia_cola,
          pix_location:   data.pix_location,
          pix_imagem:     data.pix_imagem,
        });
        setScreen('pix');
      } else {
        carrinho.clear();
        setScreen('sucesso');
      }
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handlePixConfirmado() {
    carrinho.clear();
    setScreen('sucesso');
  }

  if (screen === 'pix' && pixData) {
    return (
      <PixPayment
        pedidoId={pedidoId}
        total={totalGeral}
        pixCopiaECola={pixData.pix_copia_cola ?? ''}
        pixImagem={pixData.pix_imagem ?? null}
        onConfirmado={handlePixConfirmado}
      />
    );
  }

  if (screen === 'sucesso') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="font-serif text-forest text-2xl font-bold mb-3">Pedido Confirmado!</h1>
        <p className="text-wood mb-6 leading-relaxed">
          Seu pedido <strong>{shortId(pedidoId)}</strong> já entrou em preparo.<br />
          Você receberá uma mensagem no WhatsApp com atualizações! 📲
        </p>
        <div className="card w-full mb-4 flex items-center gap-3">
          <span className="text-3xl">📲</span>
          <div className="text-left">
            <p className="font-semibold text-forest text-sm">Notificação enviada via WhatsApp</p>
            <p className="text-xs text-pinus-text mt-0.5">Você receberá um aviso quando o motoboy sair.</p>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="btn-forest w-full">
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <FormCheckout
      loading={loading}
      erro={erro}
      subtotal={carrinho.subtotal}
      itens={carrinho.items}
      onConfirmar={handleConfirmar}
      onVoltar={() => router.back()}
    />
  );
}
