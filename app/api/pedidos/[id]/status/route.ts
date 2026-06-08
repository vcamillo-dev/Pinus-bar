import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { enviarWhatsApp, msgClienteEntrega } from '@/lib/whatsapp/zapi';
import type { Pedido, StatusPedido } from '@/types';

const TRANSICOES_VALIDAS: Partial<Record<StatusPedido, StatusPedido[]>> = {
  pendente:       ['preparando', 'cancelado'],
  aguardando_pix: ['cancelado'],
  preparando:     ['saiu_entrega', 'cancelado'],
  saiu_entrega:   ['entregue'],
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação admin
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { status } = await req.json() as { status: StatusPedido };

  // Buscar pedido atual
  const supabase = createServiceClient();
  const { data: pedidoAtual } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!pedidoAtual) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  // Validar transição de status
  const permitidos = TRANSICOES_VALIDAS[pedidoAtual.status as StatusPedido] ?? [];
  if (!permitidos.includes(status)) {
    return NextResponse.json(
      { error: `Transição inválida: ${pedidoAtual.status} → ${status}` },
      { status: 422 }
    );
  }

  // Atualizar status
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single();

  if (error || !pedido) {
    return NextResponse.json({ error: 'Falha ao atualizar pedido' }, { status: 500 });
  }

  const p = pedido as Pedido;

  // 🛵 Notificar cliente quando motoboy sair
  if (status === 'saiu_entrega' && !p.wpp_entrega_ok) {
    enviarWhatsApp(p.telefone_cliente, msgClienteEntrega(p)).then(ok => {
      if (ok) supabase.from('pedidos').update({ wpp_entrega_ok: true }).eq('id', p.id);
    });
  }

  return NextResponse.json({ ok: true, pedido: p });
}
