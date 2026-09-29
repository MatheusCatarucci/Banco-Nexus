interface FaixaPromoProps {
  titulo: React.ReactNode;
  descricao: string;
}

/** Cartão de destaque com o trecho roxo em destaque. */
export function FaixaPromo({ titulo, descricao }: FaixaPromoProps) {
  return (
    <div className="w-[240px] shrink-0 rounded-2xl bg-superficie p-5">
      <p className="text-sm leading-snug">
        {titulo} <span className="text-suave">{descricao}</span>
      </p>
    </div>
  );
}
