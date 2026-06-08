'use client';

import { useState } from 'react';
import type { CartItem, FormCheckoutData, Bairro } from '@/types';
import { BAIRROS } from '@/types';
import { fmt } from '@/lib/utils';

interface Props {
  itens:       CartItem[];
  subtotal:    number;
  loading:     boolean;
  erro:        string | null;
  onConfirmar: (form: FormCheckoutData) => void;
  onVoltar:    () => void;
}

export default function FormCheckout({ itens, subtotal, loading, erro, onConfirmar, onVoltar }: Props) {
  const [form, setForm] = useState<FormCheckoutData>({
    nome:            '',
    telefone:        '',
    bairro:          BAIRROS[0],
    rua:             '',
    numero:          '',
    complemento:     '',
    forma_pagamento: 'pix',
  });

  const set = (field: keyof FormCheckoutData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (field === 'bairro') {
        const b = BAIRROS.find(b => b.nome === e.target.value)!;
        setForm(f => ({ ...f, bairro: b }));
      } else {
        setForm(f => ({ ...f, [field]: e.target.value }));
      }
    };

  const total = subtotal + form.bairro.taxa;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirmar(form);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest px-[18px] py-[14px] flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center text-base"
        >
          ←
        </button>
        <span className="font-serif text-gold-light text-[19px] font-bold">Finalizar Pedido</span>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4 pb-8">

        {/* Resumo */}
        <Section title="📋 Resumo do Pedido">
          <div className="space-y-1.5">
            {itens.map(item => (
              <div key={item.id} className="flex justify-between text-[12px]">
                <span className="text-wood">{item.nome} ×{item.qty}</span>
                <span className="font-semibold text-forest">{fmt(item.preco * item.qty)}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Dados pessoais */}
        <Section title="👤 Seus Dados">
          <Field label="Nome Completo" required>
            <input className="input" required minLength={3} value={form.nome} onChange={set('nome')} placeholder="João da Silva" />
          </Field>
          <Field label="WhatsApp (com DDD)" required>
            <input className="input" required type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(55) 9 9999-9999" />
          </Field>
        </Section>

        {/* Endereço */}
        <Section title="📍 Endereço de Entrega">
          <Field label="Bairro / Taxa de Entrega" required>
            <select className="input" value={form.bairro.nome} onChange={set('bairro')}>
              {BAIRROS.map(b => (
                <option key={b.nome} value={b.nome}>
                  {b.nome} {b.taxa > 0 ? `(+${fmt(b.taxa)})` : '(Grátis)'}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Rua" required>
                <input className="input" required value={form.rua} onChange={set('rua')} placeholder="Rua das Flores" />
              </Field>
            </div>
            <Field label="Número" required>
              <input className="input" required value={form.numero} onChange={set('numero')} placeholder="123" />
            </Field>
          </div>
          <Field label="Complemento (opcional)">
            <input className="input" value={form.complemento} onChange={set('complemento')} placeholder="Ap. 4, casa dos fundos..." />
          </Field>
        </Section>

        {/* Pagamento */}
        <Section title="💳 Forma de Pagamento">
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'pix',          label: '📲 Pix',    sub: 'Confirmação online' },
              { id: 'cartao_entrega',label: '💳 Cartão', sub: 'Maquininha na entrega' },
            ] as { id: FormCheckoutData['forma_pagamento']; label: string; sub: string }[]).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, forma_pagamento: opt.id }))}
                className={`rounded-xl py-3 px-2 text-center border-2 transition-all ${
                  form.forma_pagamento === opt.id
                    ? 'border-gold bg-gold/10'
                    : 'border-cream-dark bg-white'
                }`}
              >
                <div className="text-lg mb-1">{opt.label.split(' ')[0]}</div>
                <div className={`text-[12px] font-bold ${form.forma_pagamento === opt.id ? 'text-forest' : 'text-pinus-text'}`}>
                  {opt.label.split(' ').slice(1).join(' ')}
                </div>
                <div className="text-[10px] text-pinus-text mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Total */}
        <div className="bg-forest rounded-2xl px-4 py-4 space-y-1.5">
          <div className="flex justify-between text-forest-light text-[12px]">
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-forest-light text-[12px]">
            <span>Taxa de entrega</span>
            <span>{form.bairro.taxa > 0 ? fmt(form.bairro.taxa) : 'Grátis'}</span>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-2 mt-1">
            <span className="text-gold-light font-bold">Total</span>
            <span className="font-serif font-bold text-gold-light text-xl">{fmt(total)}</span>
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
            {erro}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-gold w-full text-[15px] py-4">
          {loading
            ? 'Processando...'
            : form.forma_pagamento === 'pix'
              ? '📲 Gerar Pix e Confirmar'
              : '✅ Confirmar Pedido'
          }
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-2.5">
      <div className="font-bold text-forest text-[13px] mb-1">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-pinus-text mb-1">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}
