import { consultarDestinatario } from "@/app/_controllers/pix_controller";
import { lerCorpo, ok, respostaDeErro } from "@/app/_lib/http";
import { exigirSessao } from "@/app/_lib/sessao";

/** Passo 1: resolve o CPF e devolve o nome do destinatário. */
export async function POST(request: Request): Promise<Response> {
  try {
    // Exige sessao: sem isso, qualquer um testaria CPFs e descobrisse quem tem
    // conta no sistema.
    await exigirSessao();

    const corpo = await lerCorpo(request);
    return ok(await consultarDestinatario(String(corpo.cpf ?? "")));
  } catch (e) {
    return respostaDeErro(e);
  }
}
