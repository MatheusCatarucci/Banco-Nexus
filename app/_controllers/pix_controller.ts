import type { Comprovante, Destinatario, NovaTransferencia } from "@/app/models/pix_model";
import { codigoPix, iniciais } from "@/app/models/pix_model";
import { ErroHttp } from "@/app/_lib/http";
import { criarClienteSupabase, type LinhaPix } from "@/app/_lib/supabase";
import { cpf, numero } from "@/app/_lib/validacao";

/** Traduz as exceções do plpgsql para mensagens que o front entende. */
function traduzirErroDoBanco(mensagem: string): ErroHttp {
  const limpa = mensagem.replace(/^[^:]*:\s*/, "").trim();

  if (/Saldo insuficiente/i.test(limpa)) return new ErroHttp("Saldo insuficiente.", 400);
  if (/Destinatário não encontrado/i.test(limpa)) {
    return new ErroHttp("Nenhum usuário encontrado com esse CPF.", 404);
  }
  if (/si mesmo/i.test(limpa)) {
    return new ErroHttp("Não é possível fazer Pix para si mesmo.", 400);
  }
  if (/maior que zero/i.test(limpa)) {
    return new ErroHttp("O valor deve ser maior que zero.", 400);
  }

  // Erro desconhecido: loga no servidor (aparece no terminal do next dev) e
  // devolve algo genérico. Devolver a mensagem crua do Postgres vazaria nomes
  // de tabela e coluna para quem fez a requisição.
  console.error("[pix] erro nao mapeado:", mensagem);
  return new ErroHttp("Não foi possível concluir a transferência.", 400);
}

/**
 * Passo 1 do checkout: resolve o CPF e devolve o nome de quem vai receber.
 * Nao move dinheiro ainda.
 */
export async function consultarDestinatario(documento: string): Promise<Destinatario> {
  const limpo = cpf(documento);

  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select('id, "NOME", "CPF"')
    .eq("CPF", Number(limpo))
    .maybeSingle();

  if (error) throw new ErroHttp(error.message, 400);
  if (!data) throw new ErroHttp("Nenhum usuário encontrado com esse CPF.", 404);

  const nome = (data as { NOME: string }).NOME;

  return { nome, cpf: limpo, iniciais: iniciais(nome) };
}

/**
 * Passo 2: confirma o pagamento. Debita, credita e grava o historico em uma
 * unica transacao do banco (a funcao transferir_pix). Se algo falhar, nada
 * acontece.
 */
export async function transferir(
  remetenteId: number,
  dados: NovaTransferencia,
): Promise<Comprovante> {
  const destinoCpf = cpf(dados.cpf);
  const valor = numero(dados.valor, "valor", 0.01, 1_000_000);

  const { data, error } = await criarClienteSupabase().rpc("transferir_pix", {
    p_remetente: remetenteId,
    p_cpf_destinatario: Number(destinoCpf),
    p_valor: valor,
  });

  if (error) throw traduzirErroDoBanco(error.message);
  if (!data) throw new ErroHttp("A transferência não retornou comprovante.", 500);

  return montarComprovante(data as LinhaPix);
}

export async function buscarComprovante(id: string, usuarioId: number): Promise<Comprovante> {
  const { data, error } = await criarClienteSupabase()
    .from("pix_transacoes")
    .select("id, remetente_id, destinatario_id, valor, criado_em")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ErroHttp(error.message, 400);
  if (!data) throw new ErroHttp("Comprovante não encontrado.", 404);

  const transacao = data as LinhaPix;

  // So quem participou da transferencia baixa o comprovante.
  if (transacao.remetente_id !== usuarioId && transacao.destinatario_id !== usuarioId) {
    throw new ErroHttp("Acesso negado.", 403);
  }

  return montarComprovante(transacao);
}

/** Busca os dois envolvidos para o comprovante ter nome em vez de id. */
async function montarComprovante(transacao: LinhaPix): Promise<Comprovante> {
  const ids = [...new Set([transacao.remetente_id, transacao.destinatario_id])];

  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select('id, "NOME", "CPF"')
    .in("id", ids);

  if (error) throw new ErroHttp(error.message, 400);

  const porId = new Map(
    (data as { id: number; NOME: string; CPF: number | null }[]).map((u) => [u.id, u]),
  );

  const remetente = porId.get(transacao.remetente_id);
  const destinatario = porId.get(transacao.destinatario_id);

  if (!remetente || !destinatario) {
    throw new ErroHttp("Não foi possível montar o comprovante.", 500);
  }

  return {
    id: transacao.id,
    valor: transacao.valor,
    criadoEm: transacao.criado_em,
    remetente: { nome: remetente.NOME, cpf: String(remetente.CPF) },
    destinatario: { nome: destinatario.NOME, cpf: String(destinatario.CPF) },
    codigo: codigoPix(transacao.id),
  };
}
