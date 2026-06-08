import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { gerarCobrancaPix } from '@/lib/efi/pix';
import { enviarWhatsApp, msgRestaurante, msgClienteConfirmacao } from '@/lib/whatsapp/zapi';
import type { Pedido } from '@/types';

const ItemSchema = z.object({
  produto_id:     z.string().uuid(),
  nome:           z.string().min(1),
  preco_unitario: z.number().positive(),
  quantidade:     z.number().int().positive(),
});

const EnderecoSchema = z.object({
  bairro:      z.string().min(1),
  rua:         z.string().min(1),
  numero:      z.string().min(1),
  complemento: z.string().optional(),
});

const PedidoSchema = z.object({
  nome_cliente:     z.string().min(3, 'Nome muito curto'),
  telefone_cliente: z.string().min(8, 'Telefone inválido'),
  itens:            z.array(ItemSchema).min(1, 'Carrinho vazio'),
  total_produtos:   z.number().positive(),
  taxa_entrega:     z.number().min(0),
  endereco_entrega: EnderecoSchema,
  forma_pagamento:  z.enum(['pix', 'cartao_entrega']),
});

export async function POST(req: Request) {
  try {
    const body = PedidoSchema.parse(await req.json());
    const supabase = createServiceClient();

    // 1. Verificar se restaurante está aberto
    const { data: config } = await supabase
      .from('configuracoes')
      .select('restaurante_aberto')
      .eq('id', 1)
      .single();

    if (!config?.restaurante_aberto) {
      return NextResponse.json(
        { error: 'Restaurante fechado no momento. Tente mais tarde!' },
        { status: 403 }
      );
    }

    // 2. Verificar disponibilidade dos produtos
    const produtoIds = body.itens.map(i => i.produto_id);
    const { data: prods } = await supabase
      .from('produtos')
      .select('id, disponivel, nome')
      .in('id', produtoIds);

    const indisponiveis = (prods ?? []).filter((p: any) => !p.disponivel);
    if (indisponiveis.length > 0) {
      return NextResponse.json(
        { error: `Item(s) indisponível(is): ${indisponiveis.map((p: any) => p.nome).join(', ')}` },
        { status: 422 }
      );
    }

    // 3. Montar dados do pedido
    let pedidoData: Record<string, unknown> = {
      ...body,
      status: body.forma_pagamento === 'pix' ? 'aguardando_pix' : 'pendente',
    };

    let pixExtra = {};

    // 4. Gerar cobrança Pix se necessário
    if (body.forma_pagamento === 'pix') {
      const total = body.total_produtos + body.taxa_entrega;
      const cobranca = await gerarCobrancaPix({
        valor:     total,
        nome:      body.nome_cliente,
        descricao: `Pedido Pinus Bar — ${body.nome_cliente}`,
      });
      pedidoData = {
        ...pedidoData,
        pix_txid:       cobranca.txid,
        pix_location:   cobranca.location,
        pix_copia_cola: cobranca.pixCopiaECola,
      };
      pixExtra = {
        pix_copia_cola: cobranca.pixCopiaECola,
        pix_location:   cobranca.location,
        pix_imagem:     cobranca.imagemQrCode,
      };
    }

    // 5. Salvar pedido no Supabase
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert(pedidoData)
      .select()
      .single();

    if (error || !pedido) {
      console.error('[API/pedidos] Supabase error:', error);
      return NextResponse.json({ error: 'Erro ao salvar pedido' }, { status: 500 });
    }

    // 6. Se cartão: notificar WhatsApp imediatamente
    if (body.forma_pagamento === 'cartao_entrega') {
      const p = pedido as Pedido;
      await Promise.allSettled([
        enviarWhatsApp(process.env.ZAPI_PHONE_RESTAURANTE!, msgRestaurante(p)).then(ok => {
          if (ok) supabase.from('pedidos').update({ wpp_restaurante_ok: true }).eq('id', p.id);
        }),
        enviarWhatsApp(p.telefone_cliente, msgClienteConfirmacao(p)).then(ok => {
          if (ok) supabase.from('pedidos').update({ wpp_cliente_ok: true }).eq('id', p.id);
        }),
      ]);
    }

    return NextResponse.json({
      pedido_id:      pedido.id,
      status:         pedido.status,
      ...pixExtra,
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[API/pedidos]', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
