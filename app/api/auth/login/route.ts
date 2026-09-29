import { autenticar } from "@/app/_controllers/usuario_controller";
import { ErroHttp, lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { iniciarSessao } from "@/app/_lib/sessao";

interface Credenciais {
  cpf: string;
  senha: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const corpo = (await lerCorpo(request)) as Partial<Credenciais>;

    if (typeof corpo.cpf !== "string" || typeof corpo.senha !== "string") {
      throw new ErroHttp("Informe cpf e senha.", 400);
    }

    const usuario = await autenticar(corpo.cpf, corpo.senha);

    // O saldo de 10.000 foi creditado no cadastro e só é lido aqui.
    await iniciarSessao(usuario.id);

    return ok(usuario);
  } catch (e) {
    return respostaDeErro(e);
  }
}
