import type { AtualizacaoUsuario, NovoUsuario, Usuario } from "@/app/models/usuario_model";
import { ErroHttp } from "@/app/_lib/http";
import { conferirSenha, gerarHashSenha } from "@/app/_lib/senha";
import { COLUNAS, criarClienteSupabase, lerErroDoSupabase, type LinhaUsuario } from "@/app/_lib/supabase";
import { cpf, numero, texto } from "@/app/_lib/validacao";

export const SALDO_INICIAL = 10000;

function paraUsuario(linha: LinhaUsuario): Usuario {
  return {
    id: linha.id,
    nome: linha.NOME,
    cpf: linha.CPF === null ? null : String(linha.CPF),
    saldo: linha.SALDO ?? 0,
  };
}

// ---------------------------------------------------------------- CREATE

export async function cadastrarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const nome = texto(dados.nome, "nome", 2, 120);
  const documento = cpf(dados.cpf);
  const senha = texto(dados.senha, "senha", 6, 72);

  // CPF é o login e precisa ser único (índice único criado no banco).
  const existente = await buscarPorCpf(documento);
  if (existente) throw new ErroHttp("Já existe um usuário com esse CPF.", 409);

  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .insert({
      NOME: nome,
      CPF: Number(documento),
      SENHA: await gerarHashSenha(senha),
      SALDO: SALDO_INICIAL,
    })
    .select(COLUNAS)
    .single();

  if (error) lerErroDoSupabase(error);

  // A senha entra em todas as leituras por causa do select, mas nunca sai daqui.
  return paraUsuario(data as LinhaUsuario);
}

// ------------------------------------------------------------------ READ

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select('id, "NOME", "CPF", "SALDO"')
    .order("id");

  if (error) lerErroDoSupabase(error);

  return (data as LinhaUsuario[]).map(paraUsuario);
}

export async function buscarUsuario(id: number): Promise<Usuario> {
  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select('id, "NOME", "CPF", "SALDO"')
    .eq("id", id)
    .maybeSingle();

  if (error) lerErroDoSupabase(error);
  if (!data) throw new ErroHttp("Usuário não encontrado.", 404);

  return paraUsuario(data as LinhaUsuario);
}

export async function buscarPorCpf(documento: string): Promise<Usuario | null> {
  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select('id, "NOME", "CPF", "SENHA", "SALDO"')
    .eq("CPF", Number(documento))
    .maybeSingle();

  if (error) lerErroDoSupabase(error);

  return data ? paraUsuario(data as LinhaUsuario) : null;
}

// ---------------------------------------------------------------- UPDATE

export async function atualizarUsuario(id: number, dados: AtualizacaoUsuario): Promise<Usuario> {
  const alteracoes: Partial<LinhaUsuario> = {};

  if (dados.nome !== undefined) alteracoes.NOME = texto(dados.nome, "nome", 2, 120);

  if (dados.cpf !== undefined) {
    const documento = cpf(dados.cpf);
    const atual = await buscarPorCpf(documento);
    if (atual && atual.id !== id) throw new ErroHttp("Já existe um usuário com esse CPF.", 409);
    alteracoes.CPF = Number(documento);
  }

  if (dados.senha !== undefined) {
    alteracoes.SENHA = await gerarHashSenha(texto(dados.senha, "senha", 6, 72));
  }

  if (dados.saldo !== undefined) alteracoes.SALDO = numero(dados.saldo, "saldo", 0, 1_000_000);

  if (Object.keys(alteracoes).length === 0) {
    throw new ErroHttp("Nenhum campo para atualizar.", 400);
  }

  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .update(alteracoes)
    .eq("id", id)
    .select('id, "NOME", "CPF", "SALDO"')
    .maybeSingle();

  if (error) lerErroDoSupabase(error);
  if (!data) throw new ErroHttp("Usuário não encontrado.", 404);

  return paraUsuario(data as LinhaUsuario);
}

// ---------------------------------------------------------------- DELETE

export async function deletarUsuario(id: number): Promise<void> {
  const { error } = await criarClienteSupabase().from("usuarios").delete().eq("id", id);

  if (error) lerErroDoSupabase(error);
}

// ------------------------------------------------------------------ SALDO

/** Credita saldo (delta pode ser negativo para debitar). */
export async function ajustarSaldo(id: number, delta: number): Promise<Usuario> {
  const atual = await buscarUsuario(id);
  const proximo = atual.saldo + delta;

  if (proximo < 0) throw new ErroHttp("Saldo insuficiente.", 400);

  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .update({ SALDO: proximo })
    .eq("id", id)
    .select('id, "NOME", "CPF", "SALDO"')
    .single();

  if (error) lerErroDoSupabase(error);

  return paraUsuario(data as LinhaUsuario);
}

// ------------------------------------------------------------------ LOGIN

export async function autenticar(documento: string, senha: string): Promise<Usuario> {
  const login = cpf(documento);
  const { data, error } = await criarClienteSupabase()
    .from("usuarios")
    .select(COLUNAS)
    .eq("CPF", Number(login))
    .maybeSingle();

  if (error) lerErroDoSupabase(error);

  const linha = data as LinhaUsuario | null;

  // Mesma mensagem nos dois casos: não revela se o CPF existe.
  const invalido = new ErroHttp("CPF ou senha inválidos.", 401);

  if (!linha?.SENHA) throw invalido;
  if (!(await conferirSenha(senha, linha.SENHA))) throw invalido;

  return paraUsuario(linha);
}
