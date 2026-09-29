import { IconeCadeado, IconeDolar, IconeSubirDescer } from "./Icones";

const ITENS = [
  { id: "inicio", rotulo: "Início", Icone: IconeSubirDescer, ativo: true },
  { id: "dinheiro", rotulo: "Dinheiro", Icone: IconeDolar, ativo: false },
  { id: "seguranca", rotulo: "Segurança", Icone: IconeCadeado, ativo: false },
];

/** Barra flutuante fixa no rodapé, no formato de pílula. */
export function BarraNavegacao() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center pb-5">
      <ul className="flex items-center gap-2 rounded-full bg-superficie/90 p-2 shadow-2xl shadow-black/60 backdrop-blur">
        {ITENS.map(({ id, rotulo, Icone, ativo }) => (
          <li key={id}>
            <button
              type="button"
              aria-label={rotulo}
              aria-current={ativo ? "page" : undefined}
              className={`grid size-12 place-items-center rounded-full transition-colors ${
                ativo
                  ? "bg-marca text-white"
                  : "text-suave hover:bg-superficie-2 hover:text-white"
              }`}
            >
              <Icone className="size-6" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
