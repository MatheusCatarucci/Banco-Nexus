// Erro com status HTTP. A controller lança, os route handlers convertem em JSON.
export class ErroHttp extends Error {
  status: number;

  constructor(mensagem: string, status = 400) {
    super(mensagem);
    this.name = "ErroHttp";
    this.status = status;
  }
}

export function ok<T>(dados: T, status = 200): Response {
  return Response.json({ dados }, { status });
}

export function erro(mensagem: string, status: number): Response {
  return Response.json({ erro: mensagem }, { status });
}

export function respostaDeErro(e: unknown): Response {
  if (e instanceof ErroHttp) return erro(e.message, e.status);
  console.error(e);
  return erro("Erro interno do servidor.", 500);
}

export async function lerCorpo(request: Request): Promise<Record<string, unknown>> {
  let corpo: unknown;

  try {
    corpo = await request.json();
  } catch {
    throw new ErroHttp("Corpo da requisição precisa ser um JSON válido.", 400);
  }

  if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
    throw new ErroHttp("Corpo da requisição precisa ser um objeto JSON.", 400);
  }

  return corpo as Record<string, unknown>;
}
