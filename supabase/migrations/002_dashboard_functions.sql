-- ═══════════════════════════════════════════════════════════
--  PINUS BAR — Stored Procedures para o Dashboard
--  Execute no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Faturamento por dia (últimos N dias) ───────────────

create or replace function faturamento_por_dia(dias int default 7)
returns table (
  data    date,
  receita numeric,
  pedidos bigint
)
language sql
security definer
as $$
  select
    created_at::date              as data,
    coalesce(sum(total_geral), 0) as receita,
    count(*)                      as pedidos
  from pedidos
  where
    created_at >= now() - (dias || ' days')::interval
    and status not in ('aguardando_pix', 'cancelado')
  group by created_at::date
  order by data asc;
$$;

-- ─── 2. Top produtos mais vendidos ────────────────────────

create or replace function top_produtos(limite int default 5)
returns table (
  nome  text,
  total bigint
)
language sql
security definer
as $$
  select
    item->>'nome'           as nome,
    sum((item->>'quantidade')::int) as total
  from pedidos,
       jsonb_array_elements(itens) as item
  where
    status not in ('aguardando_pix', 'cancelado')
    and created_at >= now() - interval '30 days'
  group by item->>'nome'
  order by total desc
  limit limite;
$$;

-- ─── 3. Proporção de métodos de pagamento ─────────────────

create or replace function proporcao_pagamentos()
returns table (
  metodo text,
  pct    numeric
)
language sql
security definer
as $$
  with totais as (
    select
      forma_pagamento,
      count(*) as qtd
    from pedidos
    where
      status not in ('aguardando_pix', 'cancelado')
      and created_at >= now() - interval '30 days'
    group by forma_pagamento
  ),
  grand_total as (
    select sum(qtd) as total from totais
  )
  select
    t.forma_pagamento as metodo,
    round((t.qtd::numeric / gt.total) * 100, 1) as pct
  from totais t, grand_total gt
  order by pct desc;
$$;

-- ─── 4. View metricas_dashboard (atualizada) ──────────────

create or replace view metricas_dashboard as
select
  -- Hoje
  coalesce(sum(total_geral) filter (
    where created_at::date = current_date
    and   status not in ('aguardando_pix','cancelado')
  ), 0) as faturamento_hoje,

  count(*) filter (
    where created_at::date = current_date
    and   status not in ('aguardando_pix','cancelado')
  ) as pedidos_hoje,

  -- Últimos 7 dias
  coalesce(sum(total_geral) filter (
    where created_at >= now() - interval '7 days'
    and   status not in ('aguardando_pix','cancelado')
  ), 0) as faturamento_7d,

  -- Ticket médio 7 dias
  coalesce(avg(total_geral) filter (
    where created_at >= now() - interval '7 days'
    and   status not in ('aguardando_pix','cancelado')
  ), 0) as ticket_medio_7d,

  -- Pedidos ativos agora
  count(*) filter (where status = 'pendente')        as pendentes,
  count(*) filter (where status = 'aguardando_pix')  as aguardando_pix,
  count(*) filter (where status = 'preparando')      as preparando,
  count(*) filter (where status = 'saiu_entrega')    as na_entrega

from pedidos;

-- ─── 5. Habilitar RLS nas novas funções ───────────────────

-- As funções usam security definer, então são executadas
-- com privilégios do dono da função (service role).
-- O anon/authenticated pode chamar via supabase.rpc().

grant execute on function faturamento_por_dia(int)  to authenticated;
grant execute on function top_produtos(int)          to authenticated;
grant execute on function proporcao_pagamentos()     to authenticated;
grant select  on metricas_dashboard                  to authenticated;
