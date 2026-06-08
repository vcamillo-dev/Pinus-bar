import axios from 'axios';
import { normalizarTelefone, shortId, fmt } from '@/lib/utils';
import type { Pedido } from '@/types';

const BASE = () =>
  `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`;

const HEADERS = () => ({
  'Content-Type': 'application/json',
  'Client-Token': process.env.ZAPI_CLIENT_TOKEN!,
});

/** Envia mensagem de texto simples via WhatsApp */
export async function enviarWhatsApp(
  telefone: string,
  mensagem: string
): Promise<boolean> {
  try {
    await axios.post(
      `${BASE()}/send-text`,
      { phone: normalizarTelefone(telefone), message: mensagem },
      { headers: HEADERS(), timeout: 8000 }
    );
    return true;
  } catch (err) {
    console.error('[ZAPI] Falha ao enviar mensagem:', (err as Error).message);
    return false;
  }
}

// ─── Templates de mensagem ────────────────────────────────

/** Mensagem para o RESTAURANTE — novo pedido recebido */
export function msgRestaurante(pedido: Pedido): string {
  const itensFmt = pedido.itens
    .map(i => `• ${i.nome} ×${i.quantidade} — ${fmt(i.preco_unitario * i.quantidade)}`)
    .join('\n');

  const end = pedido.endereco_entrega;
  const endFmt = [end.rua, end.numero, end.complemento].filter(Boolean).join(', ')
    + ` — ${end.bairro}`;

  const pagFmt = pedido.forma_pagamento === 'pix'
    ? '✅ *Pix Confirmado*'
    : '💳 *Cartão na Entrega*';

  return `🔔 *NOVO PEDIDO — PINUS BAR* 🌲

📋 *${shortId(pedido.id)}*
👤 ${pedido.nome_cliente}
📞 ${pedido.telefone_cliente}

*ITENS:*
${itensFmt}

📍 *Entrega:* ${endFmt}
💳 *Pagamento:* ${pagFmt}

💰 *Total: ${fmt(pedido.total_geral)}*
───────────────────────
🔗 Painel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/pedidos`;
}

/** Mensagem para o CLIENTE — confirmação do pedido */
export function msgClienteConfirmacao(pedido: Pedido): string {
  const resumo = pedido.itens
    .map(i => `• ${i.nome} ×${i.quantidade}`)
    .join('\n');

  return `✅ *Pedido confirmado!* 🎉

Olá, *${pedido.nome_cliente}*!

Seu pedido já entrou em preparo na nossa cozinha! 🍳

*Resumo:*
${resumo}

💰 *Total: ${fmt(pedido.total_geral)}*
🆔 *${shortId(pedido.id)}*

⏱ Previsão de entrega: *40–60 min*

Você receberá um aviso quando o motoboy sair. 🛵
*Pinus Bar* 🌲 — Obrigado pela preferência!`;
}

/** Mensagem para o CLIENTE — motoboy saiu para entrega */
export function msgClienteEntrega(pedido: Pedido): string {
  return `🛵 *Seu pedido saiu para entrega!*

Olá, *${pedido.nome_cliente}*! Boas notícias! 🎉

Seu pedido *${shortId(pedido.id)}* está a caminho.

📍 Endereço confirmado.
⏱ Previsão: *20–40 minutos*

Qualquer dúvida, responda essa mensagem.
*Pinus Bar* 🌲 — Camobi, Santa Maria`;
}
