import { transferir } from "@/app/_controllers/pix_controller";
import { lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { exigirSessao } from "@/app/_lib/sessao";
import type { NovaTransferencia } from "@/app/models/pix_model";

/** Passo 2: confirma o pagamento e devolve o comprovante. */
export async function POST(request: Request): Promise<Response> {
  try {
    // O remetente vem SEMPRE da sessao, nunca do corpo da requisicao.
    const remetenteId = await exigirSessao();
    const corpo = (await lerCorpo(request)) as Partial<NovaTransferencia>;

    const comprovante = await transferir(remetenteId, {
      cpf: String(corpo.cpf ?? ""),
      valor: Number(corpo.valor),
    });

    return ok({ ...comprovante, urlComprovante: `/api/pix/comprovante/${comprovante.id}` }, 201);
  } catch (e) {
    return respostaDeErro(e);
  }
}
