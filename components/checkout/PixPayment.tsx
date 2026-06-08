'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { fmt } from '@/lib/utils';

interface Props {
  pedidoId:      string;
  total:         number;
  pixCopiaECola: string;
  pixImagem:     string | null;
  onConfirmado:  () => void;
}

export default function PixPayment({ pedidoId, total, pixCopiaECola, pixImagem, onConfirmado }: Props) {
  const [copiado,    setCopiado]    = useState(false);
  const [aguardando, setAguardando] = useState(true);
  const supabase  = createClient();
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;

    // Subscription via Supabase Realtime — dispara imediatamente quando o webhook
    // atualizar o status do pedido de 'aguardando_pix' para 'pendente'
    const channel = supabase
      .channel(`pedido-pix-${pedidoId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'pedidos',
          filter: `id=eq.${pedidoId}`,
        },
        ({ new: novo }) => {
          if ((novo as any).status !== 'aguardando_pix') {
            confirmed.current = true;
            setAguardando(false);
            supabase.removeChannel(channel);
            setTimeout(onConfirmado, 1200); // breve pausa para mostrar ✅
          }
        }
      )
      .subscribe();

    // Fallback: polling a cada 5 segundos caso o realtime falhe
    const poll = setInterval(async () => {
      if (confirmed.current) { clearInterval(poll); return; }
      const { data } = await supabase
        .from('pedidos')
        .select('status')
        .eq('id', pedidoId)
        .single();
      if (data && data.status !== 'aguardando_pix') {
        confirmed.current = true;
        clearInterval(poll);
        setAguardando(false);
        setTimeout(onConfirmado, 1200);
      }
    }, 5000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [pedidoId]);

  async function copiar() {
    await navigator.clipboard.writeText(pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="bg-forest px-[18px] py-[14px]">
        <div className="font-serif text-gold-light text-[21px] font-black tracking-wide">🌲 PINUS BAR</div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        <div className="text-center">
          <h1 className="font-serif text-forest text-2xl font-bold mb-1">📲 Pague com Pix</h1>
          <p className="text-wood text-sm">Escaneie o QR Code ou copie o código abaixo</p>
        </div>

        {/* QR Code card */}
        <div className="card text-center space-y-4">
          <div className="flex justify-center">
            {pixImagem ? (
              <Image
                src={`data:image/png;base64,${pixImagem}`}
                alt="QR Code Pix"
                width={180}
                height={180}
                className="rounded-xl"
              />
            ) : pixCopiaECola ? (
              <QRCodeSVG
                value={pixCopiaECola}
                size={180}
                bgColor="#FAF7F2"
                fgColor="#1B4332"
                level="M"
                className="rounded-xl"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-pinus-bg rounded-xl flex items-center justify-center text-pinus-text text-sm">
                Carregando QR Code...
              </div>
            )}
          </div>

          <div className="font-serif font-bold text-forest text-3xl">{fmt(total)}</div>

          {/* Código copia e cola */}
          <div className="bg-pinus-bg rounded-lg px-3 py-2 font-mono text-[9px] text-wood break-all leading-relaxed">
            {pixCopiaECola.substring(0, 120)}...
          </div>

          <button
            onClick={copiar}
            className={`w-full rounded-xl py-3 font-bold text-sm transition-all ${
              copiado
                ? 'bg-forest-light/20 text-forest border-2 border-forest-light'
                : 'bg-cream-dark text-bark hover:bg-cream-dark/70'
            }`}
          >
            {copiado ? '✅ Código Copiado!' : '📋 Copiar Código Pix'}
          </button>
        </div>

        {/* Status de aguardo */}
        <div className={`rounded-xl px-4 py-4 text-center border-2 transition-all ${
          aguardando
            ? 'bg-yellow-50 border-gold/50'
            : 'bg-green-50 border-forest-light'
        }`}>
          {aguardando ? (
            <>
              <div className="font-bold text-forest text-sm mb-1 animate-pulse2">
                ⏳ Aguardando confirmação do pagamento...
              </div>
              <div className="text-xs text-wood">
                Após o pagamento, seu pedido entra em preparo automaticamente!
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-forest-mid text-base mb-1">✅ Pagamento confirmado!</div>
              <div className="text-xs text-wood">Redirecionando...</div>
            </>
          )}
        </div>

        <div className="text-center text-[11px] text-pinus-text space-y-1">
          <p>Validade do código: <strong>1 hora</strong></p>
          <p>O pagamento é processado de forma segura pela <strong>Efí Bank</strong></p>
        </div>
      </div>
    </div>
  );
}
