import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ErroHttp } from "./http";

const TABELA = "usuarios";

// Colunas em CAIXA ALTA: no Postgres foram criadas entre aspas, então são
// case-sensitive. O PostgREST exige as aspas também no select.
const COLUNAS = 'id, "NOME", "CPF", "SENHA", "SALDO"';

// Precisa ser `type` e não `interface`: o GenericTable do supabase exige
// `Record<string, unknown>`, e interfaces não têm índice implícito.
export type LinhaUsuario = {
  id: number;
  NOME: string;
  CPF: number | null;
  SENHA: string | null;
  SALDO: number | null;
};

// Precisa ser `type` e não `interface`: o GenericTable do supabase exige
// `Record<string, unknown>`, e interfaces não têm índice implícito.
export type LinhaPix = {
  id: string;
  remetente_id: number;
  destinatario_id: number;
  valor: number;
  criado_em: string;
};

// Tipo mínimo para o cliente saber o formato das tabelas. Em um projeto maior
// isso sai de `supabase gen types typescript`.
export type Banco = {
  public: {
    Tables: {
      usuarios: {
        Row: LinhaUsuario;
        Insert: Partial<LinhaUsuario> & Pick<LinhaUsuario, "NOME" | "CPF" | "SENHA" | "SALDO">;
        Update: Partial<LinhaUsuario>;
        Relationships: [];
      };
      pix_transacoes: {
        Row: LinhaPix;
        Insert: Pick<LinhaPix, "remetente_id" | "destinatario_id" | "valor"> & Partial<LinhaPix>;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      transferir_pix: {
        Args: {
          p_remetente: number;
          p_cpf_destinatario: number;
          p_valor: number;
        };
        Returns: LinhaPix;
      };
    };
  };
};

/**
 * Cliente "service role" (server-only). Ignora RLS, então use apenas dentro de
 * Route Handlers / Server Components. Nunca exponha esta chave ao cliente.
 */
export function criarClienteSupabase(): SupabaseClient<Banco> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Mensagem por variável: ajuda a saber exatamente o que colar no .env.local.
  if (!url) throw new ErroHttp("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local.", 500);
  if (!chave) throw new ErroHttp("Falta SUPABASE_SERVICE_ROLE_KEY no .env.local.", 500);

  return createClient<Banco>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function lerErroDoSupabase(error: { message: string; code?: string }): never {
  if (error.code === "23505") {
    throw new ErroHttp("Já existe um usuário com esse CPF.", 409);
  }
  throw new ErroHttp(error.message, 400);
}

export { TABELA, COLUNAS };
