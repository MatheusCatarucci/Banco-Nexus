/** Resumo de quem vai receber, mostrado no checkout antes da confirmacao. */
export interface Destinatario {
  nome: string;
  cpf: string;
  /** Iniciais para o avatar do checkout. */
  iniciais: string;
}

export interface NovaTransferencia {
  cpf: string;
  valor: number;
}

/** Linha crua de public.pix_transacoes. */
export interface TransacaoPix {
  id: string;
  remetente_id: number;
  destinatario_id: number;
  valor: number;
  criado_em: string;
}

/** Dados prontos para desenhar o comprovante. */
export interface Comprovante {
  id: string;
  valor: number;
  criadoEm: string;
  remetente: { nome: string; cpf: string };
  destinatario: { nome: string; cpf: string };
  /** Codigo curto que a pessoa pode usar para conferir o pagamento. */
  codigo: string;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);

  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return (partes[0][0] + partes.at(-1)![0]).toUpperCase();
}

/** Ultimos 8 caracteres do id, no formato E2E.......... . */
export function codigoPix(id: string): string {
  return `E2E${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
