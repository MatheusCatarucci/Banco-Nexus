import { IconeSeta } from "./Icones";

interface LinhaSecaoProps {
  titulo: string;
  children: React.ReactNode;
}

interface SecaoProps extends LinhaSecaoProps {
  /** Texto cinza acima do valor: "Fatura atual", "Valor disponível de até". */
  rotuloValor: string;
  valor: string;
  /** Linha cinza abaixo do valor: "Limite disponível de R$ 983,56". */
  complemento?: string;
}

/** Linha "Cartão de crédito ›" com ícone à esquerda. */
export function LinhaSecao({ titulo, children }: LinhaSecaoProps) {
  return (
    <button type="button" className="flex w-full items-center gap-3 px-5 py-4 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-superficie-2">
        {children}
      </span>
      <span className="flex-1 text-[15px] font-medium">{titulo}</span>
      <IconeSeta className="size-5 text-suave" />
    </button>
  );
}

/** Bloco com título, valor em destaque e complemento. */
export function SecaoConta({ titulo, rotuloValor, valor, complemento, children }: SecaoProps) {
  return (
    <section className="border-b border-borda py-5">
      <LinhaSecao titulo={titulo}>{children}</LinhaSecao>
      <div className="px-5">
        <p className="text-sm text-suave">{rotuloValor}</p>
        <p className="mt-0.5 text-xl font-semibold">{valor}</p>
        {complemento ? <p className="mt-4 text-sm text-suave">{complemento}</p> : null}
      </div>
    </section>
  );
}
