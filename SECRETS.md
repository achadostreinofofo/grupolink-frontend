# Secrets necessários no GitHub Actions

## Repositório: grupolink-frontend

| Secret | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública do backend (ex: `https://api.grupolink.com.br`) |
| `VERCEL_TOKEN` | Token de acesso da Vercel (Settings → Tokens) |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

## Como obter os IDs da Vercel
```bash
npx vercel link
cat .vercel/project.json
```
