<div align="center">

# NEXUS

**Carteira digital com Pix — Next.js 16, Supabase e PostgreSQL**

`cadastro` · `login` · `saldo` · `pix` · `comprovante em PDF`

</div>

---

## O que é

Um app de carteira digital. Cadastra usuário, credita **R$ 10.000** de saldo na conta nova, deixa a pessoa fazer login e transferir via Pix para outro usuário, gerando comprovante em PDF.

Feito em camadas de MVC, com a regra de ouro de que **a dependência só anda para um lado**: a view chama a controller, a controller chama a model. A model nunca importa a controller.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack, React 19) |
| Banco | Supabase / PostgreSQL |
| Cliente do banco | `@supabase/supabase-js` com service role (server-only) |
| Senhas | `scrypt` + `timingSafeEqual` (sem dependência externa) |
| Sessão | cookie HMAC-SHA256, `httpOnly` |
| PDF | `pdf-lib` |
| Estilo | Tailwind CSS 4 |
| Validação | TypeScript estrito |

## Rodando

```bash
npm install
cp .env.local.example .env.local   # renomeie para .env.local
npm run dev
```

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SESSION_SECRET=<openssl rand -base64 32>
```

Acesse `http://localhost:3000`.

> **Dev pelo IP da rede:** se abrir por `http://192.168.x.x:3000` em vez de `localhost`, adicione o IP em `allowedDevOrigins` no `next.config.ts`. Sem isso o Next bloqueia o bundle do cliente, o React não hidrata e o formulário vira um GET com a senha na URL.

## Banco de dados

Rode os dois arquivos no **SQL Editor** do Supabase, nesta ordem:

```bash
supabase/usuarios.sql   # tabela usuarios + índice único do CPF
supabase/pix.sql         # tabela pix_transacoes + função transferir_pix
```

### Por que a transferência é uma função do Postgres

Débito e crédito precisam ser **uma transação só**. Feito com dois `UPDATE` no Node, o primeiro passa e o segundo falha — e o dinheiro evapora. Por isso tudo mora em `transferir_pix()`:

- valida valor, destinatário e saldo dentro da mesma transação
- trava as duas contas com `FOR UPDATE`, **sempre ordenadas por id**, para duas transferências simultâneas não se travarem (deadlock)
- `security invoker`: roda com quem chamou, sem escalada de privilégio
- `revoke execute ... from anon`: a chave pública do navegador não consegue chamar a função, senão qualquer um transferiria da conta dos outros

## API

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| POST | `/api/usuarios` | público | Cadastra, credita 10.000, abre sessão |
| POST | `/api/auth/cadastro` | público | idem, rota explícita |
| POST | `/api/auth/login` | público | Autentica, abre sessão |
| POST | `/api/auth/logout` | público | Encerra a sessão |
| GET | `/api/auth/logout` | — | Atalho: quem está logado |
| GET | `/api/usuarios` | público | Lista todos |
| GET | `/api/usuarios/:id` | dono | Lê um |
| PATCH | `/api/usuarios/:id` | dono | Atualiza nome, cpf, senha, saldo |
| DELETE | `/api/usuarios/:id` | dono | Remove |
| POST | `/api/usuarios/:id/saldo` | dono | Credita/debita via `{ delta }` |
| POST | `/api/pix/consultar` | logado | Resolve CPF → nome do destinatário |
| POST | `/api/pix/transferir` | logado | Confirma o Pix, devolve o comprovante |
| GET | `/api/pix/comprovante/:id` | parte | Baixa o PDF |

Sucesso responde `{ "dados": ... }`, erro responde `{ "erro": "..." }` com o status HTTP correspondente.

```bash
curl -i -c cookies.txt -X POST localhost:3000/api/usuarios \
  -H 'content-type: application/json' \
  -d '{"nome":"Joao Silva","cpf":"12345678901","senha":"senha123"}'
```

## Estrutura

```
app/
├── page.tsx                  carteira (Server Component protegido)
├── login/  cadastro/  pix/
├── models/                   contrato (Model)
│   ├── usuario_model.ts
│   └── pix_model.ts
├── _controllers/             regra de negócio (Controller)
│   ├── usuario_controller.ts
│   └── pix_controller.ts
├── _components/              UI
├── _lib/                     infra: http, senha, sessão, supabase, pdf
└── api/                      route handlers
```

Pastas com `_` são privadas: o App Router ignora e elas não viram rota.

## Segurança

- **Senha nunca em claro** — `scrypt` com salt por usuário; comparação com `timingSafeEqual` para não vazar tempo
- **Mesma mensagem de erro** no login para CPF inexistente e senha errada, para não revelar quem tem conta
- **Sessão em cookie assinado** — `httpOnly`, `SameSite=lax`, HMAC-SHA256, expira em 7 dias
- **Remetente vem da sessão**, nunca do corpo da requisição
- **Service role só no servidor** — nenhuma variável `NEXT_PUBLIC_` de segredo
- **Erros do banco não vazam** para o cliente; o detalhe vai para o console

## O que dá para evoluir

- [ ] extrato de transações na carteira
- [ ] QR Code Pix estático (BR Code / EMV)
- [ ] hash de arquivo PIX com chave de reconciliação
- [ ] Recovery de senha por e-mail
- [ ] perfil admin para o `GET /api/usuarios`
- [ ] testes automatizados (a bateria hoje é manual)
- [ ] `CPF` como `varchar(11)` em vez de `bigint` — hoje o zero à esquerda se perde
