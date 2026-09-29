-- Pix: historico de transferencias + funcao de transferencia atomica.
-- Rode no SQL Editor do Supabase, DEPOIS de usuarios.sql.
-- Idempotente: pode rodar de novo sem quebrar nada.

-- ---------------------------------------------------------------- historico
create table if not exists public.pix_transacoes (
  id uuid primary key default gen_random_uuid(),
  remetente_id bigint not null references public.usuarios (id),
  destinatario_id bigint not null references public.usuarios (id),
  valor double precision not null check (valor > 0),
  criado_em timestamptz not null default now()
);

create index if not exists pix_transacoes_remetente_idx
  on public.pix_transacoes (remetente_id, criado_em desc);

-- ------------------------------------------------------- transferencia
-- Por que uma funcao e nao dois UPDATE no Node: debitar o remetente e creditar
-- o destinatario tem que ser UMA transacao. Feito no Node, o primeiro UPDATE
-- pode passar e o segundo falhar, e o dinheiro some.
--
-- O parametro p_remetente NAO pode vir do cliente: a controller sempre passa o
-- id da sessao. Se alguem pudesse chamar isso direto, transferia da conta dos
-- outros. Por isso a tabela esta bloqueada para a anon (veja o fim do arquivo).
create or replace function public.transferir_pix(
  p_remetente bigint,
  p_cpf_destinatario bigint,
  p_valor double precision
)
returns public.pix_transacoes
language plpgsql
-- security invoker (padrao): roda com os privilegios de quem chamou, que aqui
-- e a service_role, que ja ignora RLS. Nada de escalada de privilegio.
as $$
declare
  v_destino  public.usuarios;
  v_origem   public.usuarios;
  v_transacao public.pix_transacoes;
begin
  if p_valor is null or p_valor <= 0 then
    raise exception 'O valor deve ser maior que zero.';
  end if;

  select * into v_destino
  from public.usuarios
  where "CPF" = p_cpf_destinatario;

  if not found then
    raise exception 'Destinatário não encontrado.';
  end if;

  if v_destino.id = p_remetente then
    raise exception 'Não é possível transferir para si mesmo.';
  end if;

  -- Trava as duas contas de uma vez, sempre na mesma ordem (por id), para duas
  -- transferencias simultaneas nao se travarem mutuamente (deadlock).
  perform 1 from public.usuarios
  where id in (p_remetente, v_destino.id)
  order by id
  for update;

  select * into v_origem
  from public.usuarios
  where id = p_remetente;

  if not found then
    raise exception 'Remetente não encontrado.';
  end if;

  if coalesce(v_origem."SALDO", 0) < p_valor then
    raise exception 'Saldo insuficiente.';
  end if;

  update public.usuarios set "SALDO" = "SALDO" - p_valor where id = p_remetente;
  update public.usuarios set "SALDO" = coalesce("SALDO", 0) + p_valor where id = v_destino.id;

  insert into public.pix_transacoes (remetente_id, destinatario_id, valor)
  values (p_remetente, v_destino.id, p_valor)
  returning * into v_transacao;

  return v_transacao;
end;
$$;

-- ------------------------------------------------- Permissoes da funcao
-- A tabela e a funcao nao podem ser chamadas pelo navegador: com a chave
-- publica, qualquer um poderia rodar transferir_pix() escolhendo o
-- p_remetente. A API usa a service_role no servidor, que passa por cima.
revoke execute on function public.transferir_pix(bigint, bigint, double precision) from anon, authenticated;
revoke all on public.pix_transacoes from anon, authenticated;
