import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O dev server so aceita recursos de dev vindos de localhost. Ao acessar por
  // http://10.109.142.42:3000 (o "Network" que o next dev imprime) o Next
  // bloqueia /_next/*, o bundle do cliente nao carrega, o React nao hidrata e o
  // <form onSubmit> deixa de rodar o preventDefault: o navegador faz GET
  // nativo e joga a senha na URL.
  //
  // Escreva so o hostname, sem http:// e sem porta. Se o IP mudar ao trocar de
  // rede, atualize aqui. Nao use "**": liberaria qualquer origem.
  allowedDevOrigins: ["10.109.142.42"],
};

export default nextConfig;
