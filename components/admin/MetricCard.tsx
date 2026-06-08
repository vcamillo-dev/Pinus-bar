interface Props {
  label: string;
  value: string;
  sub:   string;
  icon:  string;
  cor:   string;
}

const COR_MAP: Record<string, string> = {
  forest:     'text-forest',
  'forest-mid': 'text-forest-mid',
  wood:       'text-wood',
  gold:       'text-gold',
};

export default function MetricCard({ label, value, sub, icon, cor }: Props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-pinus-text uppercase tracking-wide leading-snug">
          {label}
        </span>
        <span className="text-xl leading-none">{icon}</span>
      </div>
      <div className={`font-serif font-bold text-2xl mb-1 ${COR_MAP[cor] ?? 'text-forest'}`}>
        {value}
      </div>
      <div className="text-xs text-pinus-text">{sub}</div>
    </div>
  );
}
