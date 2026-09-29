import { buscarUsuario } from "@/app/_controllers/usuario_controller";
import { erro, ok, respostaDeErro } from "@/app/_lib/http";
import { encerrarSessao, exigirSessao } from "@/app/_lib/sessao";

export async function POST(): Promise<Response> {
  try {
    await encerrarSessao();
    return ok({ mensagem: "Sessão encerrada." });
  } catch (e) {
    return respostaDeErro(e);
  }
}

/** Quem está logado agora (o front usa isso para redirecionar). */
export async function GET(): Promise<Response> {
  try {
    const id = await exigirSessao();
    return ok(await buscarUsuario(id));
  } catch (e) {
    return respostaDeErro(e);
  }
}

export async function PUT(): Promise<Response> {
  return erro("Use POST /api/auth/logout.", 405);
}
