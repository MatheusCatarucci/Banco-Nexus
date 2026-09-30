import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O dev server so aceita recursos de dev vindos de localhost. Ao acessar por
  // http://192.168.1.13:3000 (o "Network" que o next dev imprime) o Next
  // bloqueia /_next/*, o bundle do cliente nao carrega, o React nao hidrata e o
  // <form onSubmit> deixa de rodar o preventDefault: o navegador faz GET
  // nativo e joga a senha na URL.
  //
  // Escreva so o hostname, sem http:// e sem porta. Este e o IP da LAN, por
  // onde o celular na mesma rede entra. Como e DHCP, confira o IP atual com
  // "ipconfig" e atualize aqui se mudar (ou reserve o IP no roteador). Nao use
  // "**": liberaria qualquer origem.
  allowedDevOrigins: ["192.168.1.13"],
};

export default nextConfig;
