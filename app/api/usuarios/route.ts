import { cadastrarUsuario, listarUsuarios } from "@/app/_controllers/usuario_controller";
import { lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { iniciarSessao } from "@/app/_lib/sessao";
import type { NovoUsuario } from "@/app/models/usuario_model";

/** Cadastro: cria o usuário, credita 10.000 e já abre a sessão. */
export async function POST(request: Request): Promise<Response> {
  try {
    const corpo = (await lerCorpo(request)) as Partial<NovoUsuario>;
    const usuario = await cadastrarUsuario(corpo as NovoUsuario);

    await iniciarSessao(usuario.id);

    return ok(usuario, 201);
  } catch (e) {
    return respostaDeErro(e);
  }
}

/** Lista todos. Em um app real, isso exigiria perfil admin. */
export async function GET(): Promise<Response> {
  try {
    return ok(await listarUsuarios());
  } catch (e) {
    return respostaDeErro(e);
  }
}
