# Ambientes

O app lê a API de `EXPO_PUBLIC_API_URL` (com o sufixo `/api`). O ambiente é deduzido do host da URL (`src/services/config.ts`); fora de produção aparece o selo "Homologação" no login e no Perfil.

| Onde | API |
| --- | --- |
| `.env` local (padrão) | homologação: `https://homolog.escolacentopeia.com.br/api` |
| EAS `development` | homologação |
| EAS `preview` (APK interno) | homologação |
| EAS `production` (lojas) | produção: `https://app.escolacentopeia.com.br/api` |

## Rodar local

```bash
cp .env.example .env     # já aponta para a homologação
npx expo start
```

Para testar contra produção, troque a linha do `.env` pela URL de produção e reinicie com `npx expo start -c`. **Atenção: são dados reais de alunos e responsáveis.** Volte para a homologação depois.

## Builds (EAS)

```bash
eas build --profile preview --platform android      # APK interno, homologação
eas build --profile production --platform all       # lojas, produção
```

Os perfis ficam em `eas.json`; o `env` do perfil prevalece sobre o `.env` local. As URLs são públicas, sem segredo. `submit.production` está vazio: credenciais das lojas, bundle id e pacote ainda não foram definidos.
