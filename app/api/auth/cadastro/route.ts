import { cadastrarUsuario } from "@/app/_controllers/usuario_controller";
import { erro, lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import type { NovoUsuario } from "@/app/models/usuario_model";

export async function POST(request: Request): Promise<Response> {
  try {
    const corpo = (await lerCorpo(request)) as Partial<NovoUsuario>;
    return ok(await cadastrarUsuario(corpo as NovoUsuario), 201);
  } catch (e) {
    return respostaDeErro(e);
  }
}

export async function GET(): Promise<Response> {
  return erro("Use POST /api/auth/cadastro.", 405);
}
