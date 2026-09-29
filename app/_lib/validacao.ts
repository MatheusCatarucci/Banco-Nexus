import { ErroHttp } from "./http";

export function texto(valor: unknown, campo: string, min = 1, max = 255): string {
  if (typeof valor !== "string" || valor.trim().length < min) {
    throw new ErroHttp(`Campo "${campo}" é obrigatório.`, 400);
  }
  if (valor.length > max) {
    throw new ErroHttp(`Campo "${campo}" deve ter no máximo ${max} caracteres.`, 400);
  }
  return valor.trim();
}

export function numero(valor: unknown, campo: string, min: number, max: number): number {
  const n = typeof valor === "string" ? Number(valor) : valor;

  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new ErroHttp(`Campo "${campo}" deve ser um número.`, 400);
  }
  if (n < min || n > max) {
    throw new ErroHttp(`Campo "${campo}" deve estar entre ${min} e ${max}.`, 400);
  }
  return n;
}

// CPF: 11 dígitos. (A validação de dígito verificador fica pra depois.)
export function cpf(valor: unknown, campo = "cpf"): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new ErroHttp(`Campo "${campo}" é obrigatório.`, 400);
  }

  const limpo = valor.replace(/\D/g, "");

  if (limpo.length !== 11) {
    throw new ErroHttp("CPF deve ter 11 dígitos.", 400);
  }
  return limpo;
}
