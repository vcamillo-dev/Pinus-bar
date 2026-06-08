import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { enviarWhatsApp, msgRestaurante, msgClienteConfirmacao } from '@/lib/whatsapp/zapi';
import type { Pedido } from '@/types';

interface PixRecebido {
  endToEndId: string;
  txid:       string;
  valor:      string;
  horario:    string;
  infoPagador?: string;
  pagador?: { nome: string; cpf: string };
}

interface WebhookBody {
  pix?: PixRecebido[];
}

export async function POST(req: Request) {
  // 1. Validar token de segurança enviado pela Efí Bank no header
  const token = req.headers.get('x-webhook-token');
  if (token !== process.env.EFI_WEBHOOK_SECRET) {
    console.warn('[WEBHOOK/PIX] Token inválido — requisição rejeitada');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const pixList = body?.pix ?? [];
  if (pixList.length === 0) {
    // Efí envia pings de verificação sem pix — responder 200 normalmente
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceClient();

  for (const pix of pixList) {
    try {
      // 2. Buscar pedido pelo txid — só processa se ainda estiver aguardando
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('pix_txid', pix.txid)
        .eq('status', 'aguardando_pix')
        .single();

      if (!pedido) {
        // txid desconhecido ou já processado → ignorar silenciosamente
        console.log(`[WEBHOOK/PIX] txid ${pix.txid} ignorado (não encontrado ou já processado)`);
        continue;
      }

      // 3. Atualizar status para pendente (entra na fila da cozinha)
      await supabase
        .from('pedidos')
        .update({ status: 'pendente', pix_pago_em: pix.horario })
        .eq('id', pedido.id);

      const p = { ...pedido, status: 'pendente', pix_pago_em: pix.horario } as Pedido;

      // 4. Notificar restaurante + cliente em paralelo
      await Promise.allSettled([
        enviarWhatsApp(process.env.ZAPI_PHONE_RESTAURANTE!, msgRestaurante(p)).then(ok => {
          if (ok) supabase.from('pedidos').update({ wpp_restaurante_ok: true }).eq('id', p.id);
        }),
        enviarWhatsApp(p.telefone_cliente, msgClienteConfirmacao(p)).then(ok => {
          if (ok) supabase.from('pedidos').update({ wpp_cliente_ok: true }).eq('id', p.id);
        }),
      ]);

      console.log(`[WEBHOOK/PIX] ✅ Pedido ${pedido.id} confirmado — valor ${pix.valor}`);

    } catch (err) {
      // Logar mas não falhar — Efí reenvia se não receber 200
      console.error(`[WEBHOOK/PIX] Erro ao processar txid ${pix.txid}:`, err);
    }
  }

  // Efí Bank exige HTTP 200 para parar de reenviar
  return NextResponse.json({ ok: true });
}
