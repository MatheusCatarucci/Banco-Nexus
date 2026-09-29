"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Modo = "login" | "cadastro";

function mascaraCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function FormularioAuth({ modo }: { modo: Modo }) {
  const router = useRouter();
  const cadastro = modo === "cadastro";

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = Object.fromEntries(new FormData(evento.currentTarget));

    try {
      const resposta = await fetch(cadastro ? "/api/usuarios" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });

      const corpo = await resposta.json();

      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível continuar.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErro("Servidor indisponível. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="mb-10 flex items-center gap-2 self-start">
        <span className="grid size-9 place-items-center rounded-xl bg-marca font-bold">
          N
        </span>
        <span className="text-sm font-semibold tracking-[0.2em]">NEXUS</span>
      </Link>

      <h1 className="text-[28px] font-semibold tracking-tight">
        {cadastro ? "Criar sua conta" : "Entrar na sua conta"}
      </h1>
      <p className="mt-2 text-sm text-suave">
        {cadastro
          ? "Você começa com R$ 10.000 de saldo para usar na plataforma."
          : "Use seu CPF e senha para acessar."}
      </p>

      {/* method="post" e uma rede de seguranca: se o JS nao carregar e o React
          nao hidratar, o navegador ainda faz POST em vez de GET, e a senha
          nao vaza para a URL e para o log do servidor. */}
      <form onSubmit={enviar} method="post" className="mt-8 space-y-3">
        {cadastro ? (
          <label className="block">
            <span className="text-xs font-medium text-suave">Nome</span>
            <input
              name="nome"
              required
              minLength={2}
              autoComplete="name"
              placeholder="Como quer ser chamado"
              className="mt-1 w-full rounded-2xl bg-superficie px-4 py-3.5 outline-none ring-1 ring-transparent transition focus:ring-marca"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-medium text-suave">CPF</span>
          <input
            name="cpf"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            onChange={(e) => {
              e.currentTarget.value = mascaraCpf(e.currentTarget.value);
            }}
            className="mt-1 w-full rounded-2xl bg-superficie px-4 py-3.5 outline-none ring-1 ring-transparent transition focus:ring-marca"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-suave">Senha</span>
          <input
            name="senha"
            type="password"
            required
            minLength={6}
            autoComplete={cadastro ? "new-password" : "current-password"}
            placeholder="Mínimo de 6 caracteres"
            className="mt-1 w-full rounded-2xl bg-superficie px-4 py-3.5 outline-none ring-1 ring-transparent transition focus:ring-marca"
          />
        </label>

        {erro ? (
          <p role="alert" className="rounded-2xl bg-red-950/60 px-4 py-3 text-sm text-red-300">
            {erro}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-2xl bg-marca py-4 font-semibold transition-colors hover:bg-marca-clara disabled:opacity-60"
        >
          {enviando ? "Aguarde..." : cadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-suave">
        {cadastro ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
        <Link
          href={cadastro ? "/login" : "/cadastro"}
          className="font-medium text-marca-clara hover:underline"
        >
          {cadastro ? "Entrar" : "Cadastre-se"}
        </Link>
      </p>
    </main>
  );
}
