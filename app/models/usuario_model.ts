// Contrato (Model) do usuário.
// A API/banco devolve as colunas em CAIXA ALTA ("NOME", "CPF", "SENHA", "SALDO")
// porque estão entre aspas no Postgres. Aqui elas são convertidas para
// minúsculas/camelCase para o front não precisar lidar com isso.

export interface Usuario {
  id: number;
  nome: string;
  cpf: string | null;
  saldo: number;
}

export interface NovoUsuario {
  nome: string;
  cpf: string;
  senha: string;
}

export interface AtualizacaoUsuario {
  nome?: string;
  cpf?: string;
  senha?: string;
  saldo?: number;
}
