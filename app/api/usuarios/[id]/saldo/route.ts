import { ajustarSaldo } from "@/app/_controllers/usuario_controller";
import { ErroHttp, lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { exigirSessao } from "@/app/_lib/sessao";
import { numero } from "@/app/_lib/validacao";

interface Contexto {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, contexto: Contexto): Promise<Response> {
  try {
    const { id } = await contexto.params;
    const logado = await exigirSessao();

    if (logado !== Number(id)) {
      throw new ErroHttp("Acesso negado.", 403);
    }

    const corpo = await lerCorpo(request);
    const delta = numero(corpo.delta, "delta", -1_000_000, 1_000_000);

    if (delta === 0) {
      throw new ErroHttp("O delta não pode ser zero.", 400);
    }

    return ok(await ajustarSaldo(logado, delta));
  } catch (e) {
    return respostaDeErro(e);
  }
}
