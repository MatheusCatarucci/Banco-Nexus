import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioPix } from "@/app/_components/FormularioPix";
import { IconeSeta } from "@/app/_components/Icones";
import { buscarUsuario } from "@/app/_controllers/usuario_controller";
import { moeda } from "@/app/_lib/moeda";
import { usuarioDaSessao } from "@/app/_lib/sessao";

export default async function PixPage() {
  const id = await usuarioDaSessao();

  if (id === null) redirect("/login");

  const usuario = await buscarUsuario(id);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md border-x border-borda bg-tinta px-6 py-8">
      <Link
        href="/"
        aria-label="Voltar"
        className="grid size-10 place-items-center rounded-full bg-superficie-2 text-suave transition-colors hover:text-white"
      >
        <IconeSeta className="size-5 rotate-180" />
      </Link>

      <h1 className="mt-6 text-[28px] font-semibold tracking-tight">Fazer Pix</h1>
      <p className="mt-1 text-sm text-suave">
        Saldo disponível: <span className="text-white">{moeda(usuario.saldo)}</span>
      </p>

      <div className="mt-6">
        <FormularioPix saldoAtual={usuario.saldo} nomeUsuario={usuario.nome.split(" ")[0]} />
      </div>
    </main>
  );
}
