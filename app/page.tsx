import type { ComponentType, SVGProps } from "react";
import { redirect } from "next/navigation";
import { buscarUsuario } from "@/app/_controllers/usuario_controller";
import { moeda } from "@/app/_lib/moeda";
import { usuarioDaSessao } from "@/app/_lib/sessao";
import { BarraNavegacao } from "./_components/BarraNavegacao";
import { BotaoSair } from "./_components/BotaoSair";
import { CartaoAcao } from "./_components/CartaoAcao";
import { FaixaPromo } from "./_components/FaixaPromo";
import {
  IconeCartao,
  IconeCelular,
  IconeCodigoBarras,
  IconePix,
  IconeRaio,
  IconeSacoDinheiro,
  IconeSeta,
  IconeSino,
  IconeTransferir,
} from "./_components/Icones";
import { LinhaSecao, SecaoConta } from "./_components/SecaoConta";
import { ListaSalas } from "./_components/ListaSalas";

type AcaoIcone = ComponentType<SVGProps<SVGSVGElement>>;

const ACOES: { icone: AcaoIcone; rotulo: string; selo?: string; href?: string }[] = [
  { icone: IconePix, rotulo: "Área Pix", href: "/pix" },
  { icone: IconeCodigoBarras, rotulo: "Pagar" },
  { icone: IconeSacoDinheiro, rotulo: "Pegar emprestado", selo: "R$ 50.000" },
  { icone: IconeTransferir, rotulo: "Transferir", href: "/pix" },
  { icone: IconeCelular, rotulo: "Recarga de celular" },
];

const FATURA = 16.44;
const LIMITE_DISPONIVEL = 983.56;

export default async function Home() {
  const id = await usuarioDaSessao();

  if (id === null) redirect("/login");

  const usuario = await buscarUsuario(id);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x border-borda bg-tinta pb-32">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-marca text-sm font-bold">
            N
          </span>
          <span className="text-sm font-semibold tracking-[0.2em]">NEXUS</span>
        </span>

        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-full bg-marca text-sm font-semibold"
          >
            {usuario.nome.charAt(0).toUpperCase()}
          </span>
          <button
            type="button"
            aria-label="Notificações"
            className="grid size-10 place-items-center rounded-full bg-superficie-2 text-suave transition-colors hover:text-white"
          >
            <IconeSino className="size-5" />
          </button>
          <BotaoSair />
        </span>
      </header>

      {/* Saldo */}
      <div className="px-5 pt-2">
        <button type="button" className="flex items-center gap-1 text-lg font-medium">
          Conta
          <IconeSeta className="size-4 text-suave" />
        </button>
        <p className="mt-3 text-[32px] font-semibold tracking-tight">
          {moeda(usuario.saldo)}
        </p>
        <p className="mt-1 truncate text-sm text-suave">{usuario.nome}</p>
      </div>

      {/* Atalhos */}
      <ul className="mt-7 flex gap-4 overflow-x-auto px-5 pb-2 sem-rolagem">
        {ACOES.map((acao) => (
          <li key={acao.rotulo}>
            <CartaoAcao
              icone={acao.icone}
              rotulo={acao.rotulo}
              selo={acao.selo}
              href={acao.href}
            />
          </li>
        ))}
      </ul>

      {/* Meus cartões */}
      <div className="mt-6 px-5">
        <LinhaSecao titulo="Meus cartões">
          <IconeCartao className="size-5 text-white" />
        </LinhaSecao>
      </div>

      {/* Faixas de destaque */}
      <ul className="mt-4 flex gap-3 overflow-x-auto px-5 pb-2 sem-rolagem">
        <li>
          <FaixaPromo
            titulo={<span className="text-marca-clara">Pix no Crédito:</span>}
            descricao="transfira sem usar o saldo da conta."
          />
        </li>
        <li>
          <FaixaPromo
            titulo={<span>Chegou a hora</span>}
            descricao="de aumentar seu limite."
          />
        </li>
      </ul>

      {/* Blocos de conta */}
      <div className="mt-6">
        <SecaoConta
          titulo="Cartão de crédito"
          rotuloValor="Fatura atual"
          valor={moeda(FATURA)}
          complemento={`Limite disponível de ${moeda(LIMITE_DISPONIVEL)}`}
        >
          <IconeCartao className="size-5 text-white" />
        </SecaoConta>

        <SecaoConta
          titulo="Empréstimo"
          rotuloValor="Valor disponível de até"
          valor="R$ 50.000,00"
        >
          <IconeRaio className="size-5 text-white" />
        </SecaoConta>
      </div>

      <div className="border-b border-borda py-5">
        <h2 className="px-5 text-lg font-medium">Acompanhe</h2>
        <div className="mt-3 flex items-center gap-3 px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-superficie-2">
            <IconeRaio className="size-5 text-white" />
          </span>
          <span className="flex-1 text-[15px] font-medium">
            Assistente de pagamentos
          </span>
          <span className="rounded-md bg-marca px-2 py-0.5 text-xs font-medium">
            Novo
          </span>
        </div>
      </div>

      <ListaSalas />

      <BarraNavegacao />
    </div>
  );
}
