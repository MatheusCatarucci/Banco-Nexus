import { consultarSalas } from "@/app/salas";
import { IconeSeta } from "./Icones";

/**
 * Islado em um componente proprio: se a API de salas (127.0.0.1:8000) estiver
 * fora do ar, a tela da carteira continua funcionando.
 */
export async function ListaSalas() {
  let salas: Awaited<ReturnType<typeof consultarSalas>> = [];

  try {
    salas = await consultarSalas();
  } catch {
    return null;
  }

  if (salas.length === 0) return null;

  return (
    <section className="border-b border-borda py-5">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-lg font-medium">Salas</h2>
        <IconeSeta className="size-5 text-suave" />
      </div>

      <ul className="mt-3 flex gap-3 overflow-x-auto px-5 sem-rolagem">
        {salas.map((sala) => (
          <li
            key={sala.nome}
            className="w-40 shrink-0 rounded-2xl bg-superficie p-4"
          >
            <p className="truncate font-medium">{sala.nome}</p>
            <p className="mt-1 text-xs text-suave">Reservar</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
