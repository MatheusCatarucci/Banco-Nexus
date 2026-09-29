import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Comprovante } from "@/app/models/pix_model";
import { moeda } from "./moeda";

const MARCA = rgb(0.541, 0.02, 0.745);
const TINTA = rgb(0.04, 0.04, 0.04);
const SUAVE = rgb(0.45, 0.45, 0.47);
const BORDA = rgb(0.9, 0.9, 0.92);
const PAPEL = rgb(0.98, 0.98, 0.99);

// A4 em pontos.
const LARGURA = 595.28;
const ALTURA = 841.89;
const MARGEM = 56;

function desenhar(
  pagina: PDFPage,
  texto: string,
  x: number,
  y: number,
  fonte_texto: PDFFont,
  tamanho: number,
  cor = TINTA,
) {
  pagina.drawText(texto, { x, y, size: tamanho, font: fonte_texto, color: cor });
}

function centralizar(
  pagina: PDFPage,
  texto: string,
  y: number,
  fonte_texto: PDFFont,
  tamanho: number,
  cor = TINTA,
) {
  const largura = fonte_texto.widthOfTextAtSize(texto, tamanho);
  desenhar(pagina, texto, (LARGURA - largura) / 2, y, fonte_texto, tamanho, cor);
}

/** Linha "rotulo .......... valor" com pontilhado no meio. */
function linhaDivida(
  pagina: PDFPage,
  rotulo: string,
  valor: string,
  y: number,
  fonte_texto: PDFFont,
  tamanho = 11,
) {
  desenhar(pagina, rotulo, MARGEM, y, fonte_texto, tamanho, SUAVE);

  const larguraValor = fonte_texto.widthOfTextAtSize(valor, tamanho);
  const xValor = LARGURA - MARGEM - larguraValor;
  desenhar(pagina, valor, xValor, y, fonte_texto, tamanho, TINTA);

  const inicio = MARGEM + fonte_texto.widthOfTextAtSize(rotulo, tamanho) + 6;
  const fim = xValor - 6;

  if (fim > inicio) {
    pagina.drawLine({
      start: { x: inicio, y: y + 2 },
      end: { x: fim, y: y + 2 },
      thickness: 0.5,
      color: BORDA,
      dashArray: [1, 2],
    });
  }
}

function dataBruta(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function cpfFormatado(cpf: string): string {
  const d = cpf.padStart(11, "0").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export async function gerarComprovantePdf(comprovante: Comprovante): Promise<Uint8Array> {
  const documento = await PDFDocument.create();
  documento.setTitle(`Comprovante Pix ${comprovante.codigo}`);
  documento.setProducer("Nexus");

  const pagina = documento.addPage([LARGURA, ALTURA]);
  const normal = await documento.embedFont(StandardFonts.Helvetica);
  const negrito = await documento.embedFont(StandardFonts.HelveticaBold);

  // --- faixa roxa do topo
  pagina.drawRectangle({
    x: 0,
    y: ALTURA - 130,
    width: LARGURA,
    height: 130,
    color: MARCA,
  });

  centralizar(pagina, "NEXUS", ALTURA - 52, negrito, 20, rgb(1, 1, 1));
  centralizar(
    pagina,
    "Comprovante de Pix",
    ALTURA - 76,
    normal,
    12,
    rgb(0.93, 0.87, 0.96),
  );

  // --- valor
  let y = ALTURA - 200;
  centralizar(pagina, "Valor enviado", y, normal, 11, SUAVE);
  y -= 34;
  centralizar(pagina, moeda(comprovante.valor), y, negrito, 30, TINTA);
  y -= 30;
  centralizar(pagina, dataBruta(comprovante.criadoEm), y, normal, 10, SUAVE);

  // --- bloco das pessoas
  y -= 46;
  pagina.drawLine({
    start: { x: MARGEM, y },
    end: { x: LARGURA - MARGEM, y },
    thickness: 1,
    color: BORDA,
  });

  y -= 32;
  linhaDivida(pagina, "Remetente", comprovante.remetente.nome, y, normal);
  y -= 22;
  linhaDivida(pagina, "CPF do remetente", cpfFormatado(comprovante.remetente.cpf), y, normal);

  y -= 40;
  linhaDivida(
    pagina,
    "Destinatário",
    comprovante.destinatario.nome,
    y,
    normal,
  );
  y -= 22;
  linhaDivida(
    pagina,
    "CPF do destinatário",
    cpfFormatado(comprovante.destinatario.cpf),
    y,
    normal,
  );

  // --- codigo de conference
  y -= 56;
  const alturaCaixa = 74;
  pagina.drawRectangle({
    x: MARGEM,
    y: y - alturaCaixa + 18,
    width: LARGURA - MARGEM * 2,
    height: alturaCaixa,
    color: PAPEL,
    borderColor: BORDA,
    borderWidth: 1,
  });

  centralizar(pagina, "CÓDIGO DE CONFERÊNCIA", y - 6, normal, 9, SUAVE);
  centralizar(pagina, comprovante.codigo, y - 32, negrito, 20, MARCA);
  centralizar(pagina, comprovante.id, y - 50, normal, 8, SUAVE);

  // --- rodape
  pagina.drawLine({
    start: { x: MARGEM, y: 130 },
    end: { x: LARGURA - MARGEM, y: 130 },
    thickness: 1,
    color: BORDA,
  });

  centralizar(
    pagina,
    "Transação concluída. Este documento não tem valor fiscal.",
    104,
    normal,
    9,
    SUAVE,
  );
  centralizar(pagina, "nexus • recibo gerado automaticamente", 88, normal, 8, SUAVE);

  return documento.save();
}
