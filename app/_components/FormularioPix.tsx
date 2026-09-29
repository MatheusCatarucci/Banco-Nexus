"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { moeda } from "@/app/_lib/moeda";
import type { Comprovante, Destinatario } from "@/app/models/pix_model";
import { IconePix, IconeSeta } from "./Icones";

type Etapa = "form" | "checkout" | "pronto";

interface ComprovanteResposta extends Comprovante {
  urlComprovante: string;
}

/** "1.234,56" ou "1234.56" -> 1234.56 */
function paraNumero(bruto: string): number {
  const limpo = bruto.replace(/[^\d,.-]/g, "");
  const temVirgula = limpo.includes(",");

  const normalizado = temVirgula ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normalizado);

  return Number.isFinite(n) ? n : NaN;
}

function mascaraCpf(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

interface FormularioPixProps {
  saldoAtual: number;
  nomeUsuario: string;
}

export function FormularioPix({ saldoAtual, nomeUsuario }: FormularioPixProps) {
  const router = useRouter();

  const [etapa, setEtapa] = useState<Etapa>("form");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [destinatario, setDestinatario] = useState<Destinatario | null>(null);
  const [valorTexto, setValorTexto] = useState("");
  const [comprovante, setComprovante] = useState<ComprovanteResposta | null>(null);

  const valor = paraNumero(valorTexto);
  const saldoDepois = saldoAtual - (Number.isFinite(valor) ? valor : 0);

  async function consultar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = Object.fromEntries(new FormData(evento.currentTarget));

    try {
      const resposta = await fetch("/api/pix/consultar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });
      const corpo = await resposta.json();

      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível consultar o CPF.");
        return;
      }

      setDestinatario(corpo.dados);
      setEtapa("checkout");
    } catch {
      setErro("Servidor indisponível. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmar() {
    if (!destinatario) return;

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/pix/transferir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cpf: destinatario?.cpf, valor }),
      });
      const corpo = await resposta.json();

      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível concluir o Pix.");
        return;
      }

      setComprovante(corpo.dados);
      setEtapa("pronto");
      router.refresh(); // a carteira precisa do saldo novo
    } catch {
      setErro("Servidor indisponível. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  function voltarAoFormulario() {
    setEtapa("form");
    setDestinatario(null);
    setComprovante(null);
    setValorTexto("");
    setErro(null);
  }

  return (
    <div>
      {etapa === "form" ? (
        <form onSubmit={consultar} method="post" className="space-y-3">
          {/* method="post" protege a senha caso o bundle nao carregue e o React
              nao hidrate: sem isso o navegador faria GET com tudo na query. */}
          <label className="block">
            <span className="text-xs font-medium text-suave">CPF de quem recebe</span>
            <input
              name="cpf"
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              onChange={(e) => {
                e.currentTarget.value = mascaraCpf(e.currentTarget.value);
              }}
              className="mt-1 w-full rounded-2xl bg-superficie px-4 py-3.5 outline-none ring-1 ring-transparent transition focus:ring-marca"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-suave">Valor</span>
            <span className="mt-1 flex items-center rounded-2xl bg-superficie px-4 ring-1 ring-transparent transition focus-within:ring-marca">
              <span className="text-suave">R$</span>
              <input
                name="valor"
                required
                inputMode="decimal"
                placeholder="0,00"
                value={valorTexto}
                onChange={(e) => setValorTexto(e.target.value)}
                className="w-full bg-transparent px-2 py-3.5 outline-none"
              />
            </span>
          </label>

          <div className="flex items-center justify-between rounded-2xl bg-superficie px-4 py-3.5 text-sm">
            <span className="text-suave">Seu saldo</span>
            <span className="font-medium">{moeda(saldoAtual)}</span>
          </div>

          {erro ? <MensagemErro>{erro}</MensagemErro> : null}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-2xl bg-marca py-4 font-semibold transition-colors hover:bg-marca-clara disabled:opacity-60"
          >
            {enviando ? "Consultando..." : "Continuar"}
          </button>
        </form>
      ) : null}

      {etapa === "checkout" && destinatario ? (
        <div>
          <p className="text-sm text-suave">Você está enviando para</p>

          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-superficie p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-marca text-sm font-semibold">
              {destinatario.iniciais}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{destinatario.nome}</span>
              <span className="block text-sm text-suave">
                CPF {destinatario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
              </span>
            </span>
          </div>

          <div className="mt-3 space-y-2 rounded-2xl bg-superficie p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-suave">Valor</span>
              <span className="text-lg font-semibold">{moeda(valor)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-suave">Saldo após</span>
              <span className={saldoDepois < 0 ? "font-medium text-red-400" : "font-medium"}>
                {moeda(saldoDepois)}
              </span>
            </div>
          </div>

          {erro ? <MensagemErro>{erro}</MensagemErro> : null}

          <button
            type="button"
            onClick={confirmar}
            disabled={enviando}
            className="mt-3 w-full rounded-2xl bg-marca py-4 font-semibold transition-colors hover:bg-marca-clara disabled:opacity-60"
          >
            {enviando ? "Enviando..." : `Confirmar ${moeda(valor)}`}
          </button>
          <button
            type="button"
            onClick={voltarAoFormulario}
            disabled={enviando}
            className="mt-2 w-full py-3 text-sm text-suave transition-colors hover:text-white"
          >
            Trocar destinatário
          </button>
        </div>
      ) : null}

      {etapa === "pronto" && comprovante ? (
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-marca">
            <IconePix className="size-8 text-white" />
          </span>

          <h2 className="mt-4 text-lg font-semibold">Pix enviado</h2>
          <p className="mt-1 text-sm text-suave">{nomeUsuario}, seu saldo foi atualizado</p>

          <p className="mt-5 text-[32px] font-semibold tracking-tight">
            {moeda(comprovante.valor)}
          </p>
          <p className="mt-1 text-sm text-suave">para {comprovante.destinatario.nome}</p>

          <div className="mt-5 rounded-2xl bg-superficie p-4">
            <p className="text-xs text-suave">Código de conferência</p>
            <p className="mt-1 font-mono text-lg tracking-[0.15em] text-marca-clara">
              {comprovante.codigo}
            </p>
          </div>

          <a
            href={comprovante.urlComprovante}
            className="mt-4 block w-full rounded-2xl bg-marca py-4 font-semibold transition-colors hover:bg-marca-clara"
          >
            Baixar comprovante em PDF
          </a>

          <Link
            href="/"
            className="mt-2 flex w-full items-center justify-center gap-1 py-3 text-sm text-suave transition-colors hover:text-white"
          >
            Voltar para a conta
            <IconeSeta className="size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function MensagemErro({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-2xl bg-red-950/60 px-4 py-3 text-sm text-red-300"
    >
      {children}
    </p>
  );
}
