-- ═══════════════════════════════════════════════════════════
--  PINUS BAR — Schema Completo
--  Execute no SQL Editor do Supabase antes de qualquer deploy
-- ═══════════════════════════════════════════════════════════

-- Extensões
create extension if not exists "uuid-ossp";

-- ─── TABELA: configuracoes ─────────────────────────────────

create table if not exists configuracoes (
  id                 int primary key default 1,
  restaurante_aberto boolean      not null default true,
  horario_abertura   time         not null default '11:00',
  horario_fechamento time         not null default '22:00',
  mensagem_fechado   text         default 'Estamos fechados no momento. Volte em breve! 🌲',
  updated_at         timestamptz  default now(),
  constraint single_row check (id = 1)
);

insert into configuracoes (id) values (1) on conflict do nothing;

-- ─── TABELA: categorias ────────────────────────────────────

create table if not exists categorias (
  id     uuid    primary key default uuid_generate_v4(),
  slug   text    not null unique,
  nome   text    not null,
  ordem  int     not null default 0,
  ativo  boolean not null default true
);

insert into categorias (slug, nome, ordem) values
  ('almoco',   'Almoço',   1),
  ('petiscos', 'Petiscos', 2),
  ('bebidas',  'Bebidas',  3)
on conflict do nothing;

-- ─── TABELA: produtos ──────────────────────────────────────

create table if not exists produtos (
  id           uuid         primary key default uuid_generate_v4(),
  categoria_id uuid         references categorias(id) on delete set null,
  nome         text         not null,
  descricao    text,
  preco        numeric(10,2) not null check (preco >= 0),
  imagem_url   text,
  disponivel   boolean      not null default true,
  ordem        int          not null default 0,
  created_at   timestamptz  default now(),
  updated_at   timestamptz  default now()
);

create index if not exists idx_produtos_categoria  on produtos(categoria_id);
create index if not exists idx_produtos_disponivel on produtos(disponivel);

-- ─── ENUM: status_pedido ───────────────────────────────────

do $$ begin
  create type status_pedido as enum (
    'aguardando_pix',
    'pendente',
    'preparando',
    'saiu_entrega',
    'entregue',
    'cancelado'
  );
exception when duplicate_object then null; end $$;

-- ─── TABELA: pedidos ───────────────────────────────────────

create table if not exists pedidos (
  id                  uuid           primary key default uuid_generate_v4(),

  -- Cliente
  nome_cliente        text           not null,
  telefone_cliente    text           not null,

  -- Itens desnormalizados (snapshot imutável do pedido)
  itens               jsonb          not null,

  -- Valores
  total_produtos      numeric(10,2)  not null,
  taxa_entrega        numeric(10,2)  not null default 0,
  total_geral         numeric(10,2)  generated always as (total_produtos + taxa_entrega) stored,

  -- Endereço
  endereco_entrega    jsonb          not null,

  -- Pagamento
  forma_pagamento     text           not null check (forma_pagamento in ('pix', 'cartao_entrega')),
  status              status_pedido  not null default 'pendente',

  -- Pix
  pix_txid            text           unique,
  pix_location        text,
  pix_copia_cola      text,
  pix_pago_em         timestamptz,

  -- WhatsApp flags
  wpp_restaurante_ok  boolean        default false,
  wpp_cliente_ok      boolean        default false,
  wpp_entrega_ok      boolean        default false,

  created_at          timestamptz    default now(),
  updated_at          timestamptz    default now()
);

create index if not exists idx_pedidos_status   on pedidos(status);
create index if not exists idx_pedidos_created  on pedidos(created_at desc);
create index if not exists idx_pedidos_pix_txid on pedidos(pix_txid);

-- ─── TRIGGER: updated_at automático ───────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pedidos_updated_at  on pedidos;
drop trigger if exists produtos_updated_at on produtos;
drop trigger if exists config_updated_at   on configuracoes;

create trigger pedidos_updated_at
  before update on pedidos
  for each row execute function set_updated_at();

create trigger produtos_updated_at
  before update on produtos
  for each row execute function set_updated_at();

create trigger config_updated_at
  before update on configuracoes
  for each row execute function set_updated_at();

-- ─── ROW LEVEL SECURITY ────────────────────────────────────

alter table configuracoes enable row level security;
alter table categorias     enable row level security;
alter table produtos       enable row level security;
alter table pedidos        enable row level security;

-- configuracoes: leitura pública, escrita apenas autenticado
create policy "config_select_public"
  on configuracoes for select using (true);

create policy "config_update_admin"
  on configuracoes for update using (auth.role() = 'authenticated');

-- categorias: leitura pública, escrita admin
create policy "categorias_select_public"
  on categorias for select using (ativo = true);

create policy "categorias_all_admin"
  on categorias for all using (auth.role() = 'authenticated');

-- produtos: leitura pública, escrita admin
create policy "produtos_select_public"
  on produtos for select using (true);

create policy "produtos_all_admin"
  on produtos for all using (auth.role() = 'authenticated');

-- pedidos: INSERT anônimo (qualquer um pode fazer pedido)
create policy "pedidos_insert_anon"
  on pedidos for insert with check (true);

-- pedidos: SELECT/UPDATE somente autenticado (admin) ou service role
create policy "pedidos_select_admin"
  on pedidos for select using (auth.role() = 'authenticated');

-- ─── REALTIME ──────────────────────────────────────────────
-- Habilitar no Supabase Dashboard → Database → Replication
-- OU via SQL:

alter publication supabase_realtime add table pedidos;
alter publication supabase_realtime add table configuracoes;
alter publication supabase_realtime add table produtos;
