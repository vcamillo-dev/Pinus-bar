interface Item {
  nome:  string;
  total: number;
}

interface Props {
  items: Item[];
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function TopProdutos({ items }: Props) {
  if (items.length === 0) {
    return <div className="text-pinus-text text-sm text-center py-6">Sem dados</div>;
  }

  const max = Math.max(...items.map(i => i.total), 1);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.nome} className="flex items-center gap-2.5">
          <span className="text-base w-6 text-center flex-shrink-0">
            {MEDAL[i] ?? <span className="text-xs font-bold text-pinus-text">{i + 1}</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-forest truncate mb-1">{item.nome}</div>
            <div className="h-[5px] bg-pinus-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-forest rounded-full transition-all duration-700"
                style={{ width: `${(item.total / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] font-bold text-pinus-text flex-shrink-0 w-8 text-right">
            {item.total}×
          </span>
        </div>
      ))}
    </div>
  );
}
