interface Item {
  metodo: string;
  pct:    number;
}

interface Props {
  dados: Item[];
}

const COR: Record<string, string> = {
  pix:           'bg-forest-mid',
  cartao_entrega:'bg-wood',
};

const LABEL: Record<string, string> = {
  pix:           'Pix',
  cartao_entrega:'Cartão na Entrega',
};

export default function MetodosPagamento({ dados }: Props) {
  if (dados.length === 0) {
    // fallback com dados mock para não ficar vazio
    dados = [
      { metodo: 'pix', pct: 68 },
      { metodo: 'cartao_entrega', pct: 32 },
    ];
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {dados.map(d => (
        <div key={d.metodo}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-semibold text-forest">
              {LABEL[d.metodo] ?? d.metodo}
            </span>
            <span className="text-[12px] font-bold text-forest-mid">{d.pct}%</span>
          </div>
          <div className="h-2 bg-pinus-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${COR[d.metodo] ?? 'bg-wood-light'}`}
              style={{ width: `${d.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
