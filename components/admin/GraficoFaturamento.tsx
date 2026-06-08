'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { fmt } from '@/lib/utils';
import type { FaturamentoDia } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  dados: FaturamentoDia[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-dark rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-bold text-forest mb-1">{label}</p>
      <p className="text-gold font-semibold">{fmt(payload[0].value)}</p>
      {payload[1] && (
        <p className="text-pinus-text text-xs">{payload[1].value} pedidos</p>
      )}
    </div>
  );
};

export default function GraficoFaturamento({ dados }: Props) {
  // Formatar labels do eixo X
  const dadosFormatados = dados.map(d => ({
    ...d,
    label: (() => {
      try { return format(parseISO(d.data), 'EEE', { locale: ptBR }); }
      catch { return d.data; }
    })(),
  }));

  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-pinus-text text-sm">
        Sem dados para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={dadosFormatados} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE0CC" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#7C5C3A' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#7C5C3A' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5EFE6' }} />
        <Bar dataKey="receita" fill="#D4A017" radius={[5, 5, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
