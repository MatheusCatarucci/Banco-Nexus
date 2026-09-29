const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function moeda(valor: number): string {
  return brl.format(valor);
}
