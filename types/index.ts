// ═══════════════════════════════════════════════════════════
//  PINUS BAR — Types
// ═══════════════════════════════════════════════════════════

export type StatusPedido =
  | 'aguardando_pix'
  | 'pendente'
  | 'preparando'
  | 'saiu_entrega'
  | 'entregue'
  | 'cancelado';

export type FormaPagamento = 'pix' | 'cartao_entrega';

// ─── Banco de Dados ───────────────────────────────────────

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  disponivel: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  categoria?: Categoria;
}

export interface ItemPedido {
  produto_id: string;
  nome: string;
  preco_unitario: number;
  quantidade: number;
}

export interface EnderecoEntrega {
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}

export interface Pedido {
  id: string;
  nome_cliente: string;
  telefone_cliente: string;
  itens: ItemPedido[];
  total_produtos: number;
  taxa_entrega: number;
  total_geral: number;
  endereco_entrega: EnderecoEntrega;
  forma_pagamento: FormaPagamento;
  status: StatusPedido;
  pix_txid: string | null;
  pix_location: string | null;
  pix_copia_cola: string | null;
  pix_pago_em: string | null;
  wpp_restaurante_ok: boolean;
  wpp_cliente_ok: boolean;
  wpp_entrega_ok: boolean;
  created_at: string;
  updated_at: string;
}

export interface Configuracoes {
  id: number;
  restaurante_aberto: boolean;
  horario_abertura: string;
  horario_fechamento: string;
  mensagem_fechado: string;
  updated_at: string;
}

export interface MetricasDashboard {
  faturamento_hoje: number;
  pedidos_hoje: number;
  faturamento_7d: number;
  ticket_medio_7d: number;
  pendentes: number;
  aguardando_pix: number;
  preparando: number;
  na_entrega: number;
}

export interface FaturamentoDia {
  data: string;
  receita: number;
  pedidos: number;
}

// ─── Carrinho ─────────────────────────────────────────────

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  qty: number;
}

export type CartAction =
  | { type: 'ADD';    item: Produto }
  | { type: 'DEC';    id: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

export interface CartState {
  items: CartItem[];
}

// ─── Checkout ─────────────────────────────────────────────

export interface Bairro {
  nome: string;
  taxa: number;
}

export interface FormCheckoutData {
  nome: string;
  telefone: string;
  bairro: Bairro;
  rua: string;
  numero: string;
  complemento: string;
  forma_pagamento: FormaPagamento;
}

// ─── API Responses ────────────────────────────────────────

export interface CriarPedidoResponse {
  pedido_id: string;
  status: StatusPedido;
  pix_copia_cola: string | null;
  pix_location: string | null;
  pix_imagem: string | null;
}

export interface ApiError {
  error: string;
}

// ─── Pix ──────────────────────────────────────────────────

export interface CobrancaPixResult {
  txid: string;
  location: string;
  pixCopiaECola: string;
  imagemQrCode: string;
}

// ─── Status helpers ───────────────────────────────────────

export const STATUS_LABEL: Record<StatusPedido, string> = {
  aguardando_pix: '⏳ Aguardando Pix',
  pendente:       '🔔 Pendente',
  preparando:     '👨‍🍳 Preparando',
  saiu_entrega:   '🛵 Na Entrega',
  entregue:       '✅ Entregue',
  cancelado:      '❌ Cancelado',
};

export const STATUS_COLOR: Record<StatusPedido, string> = {
  aguardando_pix: 'bg-yellow-100 text-yellow-800',
  pendente:       'bg-orange-100 text-orange-800',
  preparando:     'bg-green-100 text-green-800',
  saiu_entrega:   'bg-blue-100 text-blue-800',
  entregue:       'bg-gray-100 text-gray-600',
  cancelado:      'bg-red-100 text-red-700',
};

export const BAIRROS: Bairro[] = [
  { nome: 'Camobi (retirada)',  taxa: 0  },
  { nome: 'Centro',             taxa: 8  },
  { nome: 'Nsa Sra. Fátima',    taxa: 6  },
  { nome: 'Passo dos Ferreiros',taxa: 5  },
  { nome: 'Medianeira',         taxa: 7  },
  { nome: 'Rosário / Salgado',  taxa: 9  },
  { nome: 'Outro',              taxa: 12 },
];

export const NEXT_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  pendente:     'preparando',
  preparando:   'saiu_entrega',
  saiu_entrega: 'entregue',
};

export const NEXT_STATUS_LABEL: Partial<Record<StatusPedido, string>> = {
  pendente:     '→ Preparando',
  preparando:   '→ Saiu p/ Entrega',
  saiu_entrega: '→ Entregue',
};
