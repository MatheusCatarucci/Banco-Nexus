import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

interface CartaoAcaoProps {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  rotulo: string;
  selo?: string;
  href?: string;
}

/** Botão redondo da faixa de atalhos, logo abaixo do saldo. */
export function CartaoAcao({ icone: Icone, rotulo, selo, href = "#" }: CartaoAcaoProps) {
  return (
    <Link
      href={href}
      className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
    >
      <span className="relative grid size-16 place-items-center rounded-full bg-superficie-2 transition-colors duration-200 group-hover:bg-marca">
        <Icone className="size-7 text-white" />
        {selo ? (
          <span className="absolute -bottom-2 rounded-md bg-marca px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {selo}
          </span>
        ) : null}
      </span>
      <span className="mt-1 text-center text-[11px] leading-tight text-white">
        {rotulo}
      </span>
    </Link>
  );
}
