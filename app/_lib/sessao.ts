import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ErroHttp } from "./http";

const NOME_COOKIE = "nexus_sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new ErroHttp("Falta SESSION_SECRET no ambiente.", 500);
  }
  return s;
}

// Formato do cookie: "<id>.<timestamp>.<hmac>"
function assinar(usuarioId: number): string {
  const payload = `${usuarioId}.${Date.now()}`;
  const mac = createHmac("sha256", segredo()).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function verificar(token: string): number | null {
  const partes = token.split(".");

  if (partes.length !== 3) return null;

  const [id, timestamp, mac] = partes;
  const payload = `${id}.${timestamp}`;

  const esperado = createHmac("sha256", segredo()).update(payload).digest();
  const recebido = Buffer.from(mac, "hex");

  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) {
    return null;
  }

  // Expira?
  if (Date.now() - Number(timestamp) > DURACAO_SEGUNDOS * 1000) return null;

  return Number(id);
}

export async function iniciarSessao(usuarioId: number): Promise<void> {
  const store = await cookies();

  store.set(NOME_COOKIE, assinar(usuarioId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function encerrarSessao(): Promise<void> {
  const store = await cookies();
  store.delete(NOME_COOKIE);
}

export async function usuarioDaSessao(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(NOME_COOKIE)?.value;
  return token ? verificar(token) : null;
}

/** Para rotas protegidas: devolve o id ou lança 401. */
export async function exigirSessao(): Promise<number> {
  const id = await usuarioDaSessao();
  if (id === null) throw new ErroHttp("Não autenticado.", 401);
  return id;
}
