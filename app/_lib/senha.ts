import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Formato guardado no banco: "salt:hash" (hex). A senha em claro nunca é salva.
export async function gerarHashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(senha, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [salt, hashHex] = guardado.split(":");

  if (!salt || !hashHex) return false;

  const hash = (await scryptAsync(senha, salt, 64)) as Buffer;
  const esperado = Buffer.from(hashHex, "hex");

  // timingSafeEqual exige mesmo tamanho, senão lança.
  if (hash.length !== esperado.length) return false;

  return timingSafeEqual(hash, esperado);
}
