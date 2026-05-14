# GrupoLink — Frontend

Interface web da plataforma **GrupoLink**: SaaS para gerenciamento inteligente de grupos WhatsApp voltado a afiliados e vendedores de e-commerce.

Construído com **Next.js 14 App Router**, **TypeScript** e **Tailwind CSS**.

---

## Índice

- [Visão geral](#visão-geral)
- [Stack técnica](#stack-técnica)
- [Pré-requisitos](#pré-requisitos)
- [Clone e instalação](#clone-e-instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rodando localmente](#rodando-localmente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Scripts disponíveis](#scripts-disponíveis)
- [CI/CD](#cicd)
- [Deploy em produção](#deploy-em-produção)

---

## Visão geral

O frontend do GrupoLink oferece:

- **Landing page** com apresentação do produto e planos de preço
- **Autenticação** via e-mail/senha e Google OAuth2
- **Dashboard** com visão geral, analytics, gestão de estruturas e grupos
- **Smart links** e links curtos rastreáveis
- **Mensagens agendadas** e templates
- **Integração WhatsApp Business** e gestão de conta
- **Planos e assinatura** via Mercado Pago
- **Configurações** de perfil (nome, e-mail, CPF, senha)
- **Páginas legais** (Política de Privacidade e Termos de Uso — LGPD)

---

## Stack técnica

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.x | Framework React (App Router) |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Estilização utilitária |
| react-hook-form | 7.x | Gerenciamento de formulários |
| Zod | 3.x | Validação de schemas |
| Recharts | 2.x | Gráficos (clicks, churn) |
| Lucide React | latest | Ícones |
| next/navigation | built-in | Roteamento client-side |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Verificação |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |

> O backend do GrupoLink deve estar rodando em `http://localhost:8080` para que as chamadas de API funcionem. Veja o repositório [grupolink-backend](https://github.com/achadostreinofofo/grupolink-backend) para instruções de setup.

---

## Clone e instalação

### 1. Clone o repositório

```bash
git clone https://github.com/achadostreinofofo/grupolink-frontend.git
cd grupolink-frontend
```

### 2. Instale as dependências

```bash
npm install --legacy-peer-deps
```

> A flag `--legacy-peer-deps` é necessária por conflitos de peer dependency entre `eslint-config-next` e versões do ESLint.

---

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env.local
```

Abra `.env.local` e configure:

```env
# URL base do backend Spring Boot
# Em desenvolvimento local: http://localhost:8080
# Em produção: URL pública do seu backend (ex: https://api.grupolink.com.br)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Importante:** variáveis com prefixo `NEXT_PUBLIC_` são expostas no bundle do cliente. Nunca coloque secrets (tokens, senhas) em variáveis com esse prefixo.

### Como o proxy funciona

O `next.config.js` está configurado com uma regra de **rewrite** que faz o Next.js atuar como proxy para o backend:

```
Browser → /api/qualquercoisa → Next.js → http://localhost:8080/api/qualquercoisa
```

Isso evita problemas de CORS em desenvolvimento e mantém a URL do backend opaca para o cliente.

---

## Rodando localmente

### Passo 1 — Suba o backend

O frontend precisa do backend rodando. No repositório [grupolink-backend](https://github.com/achadostreinofofo/grupolink-backend):

```bash
# Sobe PostgreSQL, Redis e RabbitMQ via Docker
docker-compose up -d postgres redis rabbitmq

# Sobe a aplicação Spring Boot
./gradlew bootRun
```

O backend estará disponível em `http://localhost:8080`.

### Passo 2 — Suba o frontend

```bash
npm run dev
```

Acesse **http://localhost:3000**.

### Verificando se está tudo funcionando

1. Abra `http://localhost:3000` — a landing page deve aparecer
2. Clique em **Criar conta grátis** e cadastre um usuário
3. Faça login e acesse o dashboard em `http://localhost:3000/dashboard`
4. A API do backend está acessível via `http://localhost:8080/swagger-ui.html`

---

## Estrutura de pastas

```
src/
├── app/                        # App Router do Next.js 14
│   ├── (auth)/                 # Grupo de rotas de autenticação (layout centralizado)
│   │   ├── login/page.tsx      # Página de login
│   │   ├── signup/page.tsx     # Página de cadastro (com CPF)
│   │   └── callback/page.tsx   # Callback do Google OAuth2
│   ├── dashboard/              # Área autenticada
│   │   ├── layout.tsx          # Layout com Sidebar
│   │   ├── page.tsx            # Visão geral (stats + gráfico + ações pendentes)
│   │   ├── structures/         # Gestão de estruturas e grupos
│   │   ├── analytics/          # Analytics completo (cliques, churn, UTM)
│   │   ├── messages/           # Mensagens agendadas
│   │   ├── templates/          # Templates de mensagem
│   │   ├── links/              # Links curtos rastreáveis
│   │   ├── integrations/       # Conta WhatsApp Business
│   │   ├── billing/            # Planos e assinatura
│   │   └── settings/           # Perfil, senha e sessão
│   ├── billing/
│   │   ├── success/page.tsx    # Retorno de checkout aprovado
│   │   └── failure/page.tsx    # Retorno de checkout recusado
│   ├── politica-de-privacidade/page.tsx
│   ├── termos-de-uso/page.tsx
│   └── page.tsx                # Landing page
│
├── components/
│   ├── ui/                     # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── landing/                # Seções da landing page
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── CtaSection.tsx
│   │   └── Footer.tsx
│   └── dashboard/              # Componentes específicos do dashboard
│       ├── Sidebar.tsx
│       ├── ClicksChart.tsx     # Gráfico de barras (recharts)
│       ├── ChurnChart.tsx      # Gráfico de área (recharts)
│       ├── UtmTable.tsx        # Tabela UTM com barras de progresso
│       └── PendingActionsCard.tsx
│
├── lib/
│   ├── api.ts                  # Cliente HTTP tipado para todos os endpoints
│   └── auth.ts                 # Helpers de autenticação (JWT + cookie)
│
├── middleware.ts               # Proteção de rotas (verifica cookie gl_token)
└── types/
    └── index.ts                # Interfaces TypeScript globais
```

---

## Rotas da aplicação

### Públicas (sem autenticação)
| Rota | Descrição |
|---|---|
| `/` | Landing page com hero, features e pricing |
| `/login` | Login com e-mail/senha ou Google |
| `/signup` | Cadastro (nome, e-mail, CPF, senha) |
| `/auth/callback` | Callback após Google OAuth2 |
| `/billing/success` | Confirmação de pagamento |
| `/billing/failure` | Falha no pagamento |
| `/politica-de-privacidade` | Política de Privacidade (LGPD) |
| `/termos-de-uso` | Termos de Uso |

### Protegidas (requerem login)
| Rota | Descrição |
|---|---|
| `/dashboard` | Visão geral com métricas e gráfico |
| `/dashboard/structures` | Lista de estruturas |
| `/dashboard/structures/new` | Criar estrutura |
| `/dashboard/structures/[id]` | Detalhes, grupos e links da estrutura |
| `/dashboard/analytics` | Analytics completo |
| `/dashboard/messages` | Mensagens agendadas |
| `/dashboard/templates` | Templates de mensagem |
| `/dashboard/links` | Links curtos |
| `/dashboard/integrations` | Conta WhatsApp Business |
| `/dashboard/billing` | Planos e assinatura |
| `/dashboard/settings` | Perfil e configurações |

---

## Scripts disponíveis

```bash
# Inicia o servidor de desenvolvimento com hot-reload
npm run dev

# Gera build de produção otimizado
npm run build

# Inicia o servidor de produção (requer build anterior)
npm run start

# Executa o linter ESLint
npm run lint
```

---

## CI/CD

O pipeline de CI é executado automaticamente em **push** e **pull requests** para `master` e `develop`.

### Jobs obrigatórios (bloqueiam merge se falharem)

| Job | O que faz |
|---|---|
| `quality` | TypeScript type check (`tsc --noEmit`) + ESLint |
| `build` | `next build` completo simulando produção |
| `security` | npm audit + Trivy filesystem CVE scan + Dependency Review (em PRs) |

### Deploy automático (CD)

O deploy para a **Vercel** é acionado automaticamente em push para `master`. Configure os seguintes secrets no repositório:

| Secret | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública do backend em produção |
| `VERCEL_TOKEN` | Token de acesso da Vercel |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

Para obter os IDs da Vercel:
```bash
npx vercel link
cat .vercel/project.json
```

---

## Deploy em produção

### Opção A — Vercel (recomendado para Next.js)

1. Importe o repositório em [vercel.com](https://vercel.com)
2. Defina a variável de ambiente `NEXT_PUBLIC_API_URL` com a URL do backend
3. O deploy acontece automaticamente a cada push na `master`

### Opção B — Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.grupolink.com.br \
  -t grupolink-frontend .

docker run -p 3000:3000 grupolink-frontend
```

### Opção C — AWS Amplify

1. Conecte o repositório no [console do Amplify](https://console.aws.amazon.com/amplify)
2. Configure `NEXT_PUBLIC_API_URL` nas variáveis de ambiente do Amplify
3. O build é disparado automaticamente a cada push

---

## Licença

Projeto acadêmico — PosTech FIAP. Todos os direitos reservados.
