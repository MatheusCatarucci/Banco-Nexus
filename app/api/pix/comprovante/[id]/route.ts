import { buscarComprovante } from "@/app/_controllers/pix_controller";
import { gerarComprovantePdf } from "@/app/_lib/comprovante";
import { ErroHttp } from "@/app/_lib/http";
import { exigirSessao } from "@/app/_lib/sessao";

export const runtime = "nodejs";

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Baixa o comprovante em PDF. Regerado a partir do banco, nao guardado. */
export async function GET(_request: Request, contexto: Contexto): Promise<Response> {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await contexto.params;

    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ErroHttp("Comprovante inválido.", 400);

    const comprovante = await buscarComprovante(id, usuarioId);
    const pdf = await gerarComprovantePdf(comprovante);

    // Uint8Array precisa virar ArrayBuffer para o BodyInit do Response.
    return new Response(pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="comprovante-pix-${comprovante.codigo}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof ErroHttp) {
      return Response.json({ erro: e.message }, { status: e.status });
    }
    console.error(e);
    return Response.json({ erro: "Erro interno do servidor." }, { status: 500 });
  }
}
