import { atualizarUsuario, buscarUsuario, deletarUsuario } from "@/app/_controllers/usuario_controller";
import { ErroHttp, lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { exigirSessao } from "@/app/_lib/sessao";
import type { AtualizacaoUsuario } from "@/app/models/usuario_model";

interface Contexto {
  params: Promise<{ id: string }>;
}

async function idAutorizado(contexto: Contexto): Promise<number> {
  const { id } = await contexto.params;
  const numerico = Number(id);

  if (!Number.isInteger(numerico) || numerico <= 0) {
    throw new ErroHttp("Id inválido.", 400);
  }

  // Sem perfil admin por enquanto: cada usuário só acessa o próprio registro.
  const logado = await exigirSessao();

  if (logado !== numerico) {
    throw new ErroHttp("Acesso negado.", 403);
  }

  return logado;
}

export async function GET(_request: Request, contexto: Contexto): Promise<Response> {
  try {
    return ok(await buscarUsuario(await idAutorizado(contexto)));
  } catch (e) {
    return respostaDeErro(e);
  }
}

export async function PATCH(request: Request, contexto: Contexto): Promise<Response> {
  try {
    const corpo = (await lerCorpo(request)) as AtualizacaoUsuario;
    return ok(await atualizarUsuario(await idAutorizado(contexto), corpo));
  } catch (e) {
    return respostaDeErro(e);
  }
}

export async function DELETE(_request: Request, contexto: Contexto): Promise<Response> {
  try {
    await deletarUsuario(await idAutorizado(contexto));
    return ok({ mensagem: "Usuário removido." });
  } catch (e) {
    return respostaDeErro(e);
  }
}
