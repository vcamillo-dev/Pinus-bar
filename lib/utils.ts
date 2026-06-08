import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Mescla classes Tailwind com suporte a condicionais */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Formata valor monetário BR */
export function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata telefone para exibição */
export function fmtTelefone(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel;
}

/** Normaliza telefone para envio ao WhatsApp (somente dígitos com DDI) */
export function normalizarTelefone(tel: string): string {
  const d = tel.replace(/\D/g, '');
  return d.startsWith('55') ? d : `55${d}`;
}

/** Data/hora no fuso de Brasília */
export function fmtDataHora(iso: string): string {
  return format(new Date(iso), "dd/MM 'às' HH:mm", { locale: ptBR });
}

/** Tempo relativo ("há 5 min") */
export function tempoAtras(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

/** Trunca UUID para exibição */
export function shortId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
