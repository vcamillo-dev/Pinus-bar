-- ═══════════════════════════════════════════════════════════
--  PINUS BAR — Seed de Produtos
--  Execute após o schema para popular o cardápio inicial
-- ═══════════════════════════════════════════════════════════

-- Buscar IDs das categorias para usar nas inserções
do $$
declare
  id_almoco   uuid;
  id_petiscos uuid;
  id_bebidas  uuid;
begin
  select id into id_almoco   from categorias where slug = 'almoco';
  select id into id_petiscos from categorias where slug = 'petiscos';
  select id into id_bebidas  from categorias where slug = 'bebidas';

  -- ALMOÇO
  insert into produtos (categoria_id, nome, descricao, preco, ordem) values
    (id_almoco, 'Frango Grelhado Completo',
     'Filé grelhado, arroz, feijão preto, salada e farofa da casa',
     28.90, 1),
    (id_almoco, 'Galeto ao Molho Verde',
     'Galeto suculento ao molho de ervas frescas com batatas rústicas',
     32.50, 2),
    (id_almoco, 'Costelinha Assada',
     'Costelinha de porco no bafo com legumes grelhados e pão na chapa',
     38.90, 3),
    (id_almoco, 'Filé Acebolado',
     'Filé mignon acebolado, arroz branco, batata palha e salada',
     42.90, 4),
    (id_almoco, 'Prato Executivo',
     'Prato do dia com arroz, feijão, proteína da casa e salada',
     24.90, 5)
  on conflict do nothing;

  -- PETISCOS
  insert into produtos (categoria_id, nome, descricao, preco, ordem) values
    (id_petiscos, 'Bolinho de Bacalhau',
     'Bolinhos crocantes de bacalhau com molho tártaro — 8 unidades',
     22.90, 1),
    (id_petiscos, 'Frango na Brasa 500g',
     'Frango marinado grelhado na brasa com chimichurri artesanal',
     26.90, 2),
    (id_petiscos, 'Batata Frita Rústica',
     'Batatas crocantes com ervas da casa e maionese artesanal',
     18.90, 3),
    (id_petiscos, 'Linguiça Toscana',
     'Linguiça grelhada na brasa, pão artesanal e molho verde',
     24.90, 4),
    (id_petiscos, 'Rabada com Agrião',
     'Rabada desfiada ao molho pardo com agrião fresco e polenta',
     34.90, 5),
    (id_petiscos, 'Porcão de Frango',
     'Mix de cortes de frango na brasa, 600g com acompanhamentos',
     38.90, 6)
  on conflict do nothing;

  -- BEBIDAS
  insert into produtos (categoria_id, nome, descricao, preco, ordem) values
    (id_bebidas, 'Chopp Pilsen 500ml',
     'Chopp artesanal gelado, levinho e refrescante — o clássico do Pinus',
     9.90, 1),
    (id_bebidas, 'Chopp Escuro 500ml',
     'Chopp escuro encorpado com notas de caramelo e malte torrado',
     11.90, 2),
    (id_bebidas, 'Refrigerante 350ml',
     'Coca-Cola, Guaraná Antarctica, Sprite ou Fanta Laranja — gelados',
     5.90, 3),
    (id_bebidas, 'Suco Natural 400ml',
     'Laranja, maracujá, abacaxi com hortelã ou melancia — na hora',
     8.90, 4),
    (id_bebidas, 'Cerveja Long Neck',
     'Heineken, Stella Artois ou Corona — 330ml gelada',
     10.90, 5),
    (id_bebidas, 'Água Mineral 500ml',
     'Gelada, com ou sem gás — da fonte Prata',
     4.50, 6)
  on conflict do nothing;

end $$;
