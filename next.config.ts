import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O dev server so aceita recursos de dev vindos de localhost. Ao acessar por
  // http://10.109.142.42:3000 (o "Network" que o next dev imprime) o Next
  // bloqueia /_next/*, o bundle do cliente nao carrega, o React nao hidrata e o
  // <form onSubmit> deixa de rodar o preventDefault: o navegador faz GET
  // nativo e joga a senha na URL.
  //
  // Escreva so o hostname, sem http:// e sem porta. Ha um IP por rede: o da rede
  // local e o da rede movel/operadora. Se o IP mudar, acrescente aqui (ou
  // troque o antigo). Nao use "**": liberaria qualquer origem.
  allowedDevOrigins: ["26.73.96.159", "10.109.142.42"],
};

export default nextConfig;
