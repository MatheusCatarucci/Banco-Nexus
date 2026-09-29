import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Nexus",
  description: "Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={montserrat.variable}>
      <body className={`${montserrat.className} min-h-dvh bg-tinta text-texto antialiased`}>
        {children}
      </body>
    </html>
  );
}
