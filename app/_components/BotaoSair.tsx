"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconeSair } from "./Icones";

export function BotaoSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      aria-label="Sair da conta"
      className="grid size-10 place-items-center rounded-full bg-superficie-2 text-suave transition-colors hover:text-white disabled:opacity-50"
    >
      <IconeSair className="size-5" />
    </button>
  );
}
