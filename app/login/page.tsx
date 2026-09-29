import { redirect } from "next/navigation";
import { FormularioAuth } from "@/app/_components/FormularioAuth";
import { usuarioDaSessao } from "@/app/_lib/sessao";

export default async function LoginPage() {
  if ((await usuarioDaSessao()) !== null) redirect("/");

  return <FormularioAuth modo="login" />;
}
