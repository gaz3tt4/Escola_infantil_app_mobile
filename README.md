# Centopeia — App do Responsável

App mobile (iOS e Android) para responsáveis acompanharem a rotina escolar dos filhos: agenda, perfil e pagamentos. Consome a API REST (Laravel 12 + Sanctum) do backend **EscolaCentopeia** como ela é: nenhuma rota nova é criada pelo app. O que ainda não tem endpoint fica atrás de serviços mockados marcados com `TODO(backend)`.

## Stack

- [Expo](https://expo.dev) SDK 57 + TypeScript estrito
- React Navigation: pilha (login / troca de senha / app) + abas (Agenda, Perfil, Pagamentos)
- Axios num cliente HTTP único (`src/services/http.ts`)
- `expo-secure-store` para o token, `expo-clipboard` para copiar Pix e linha digitável

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL se precisar
npx expo start
```

`EXPO_PUBLIC_API_URL` aponta para a API com o sufixo `/api`:

- Homologação: `https://homolog.escolacentopeia.com.br/api`
- Produção: `https://app.escolacentopeia.com.br/api`

Ambientes, perfis do EAS e selo de homologação: veja [AMBIENTES.md](AMBIENTES.md).

Sem a variável, o app mostra um erro de configuração em vez de usar uma URL fixa.

Verificações:

```bash
npm run typecheck
npm run lint
```

## Estrutura

```
src/
  services/          Única camada que conhece o backend
    http.ts            Cliente axios: baseURL do env, Accept: application/json, Bearer,
                       401/403 (acesso desativado) encerram a sessão
    errors.ts          ApiError normalizado (422 por campo, 429, rede, timeout)
    session.ts         Token e flag must_change_password no SecureStore
    types.ts           Tipos das respostas da API
    auth.ts            /login, /logout, /me, /senha
    alunos.ts          /meus-alunos, /alunos/{id}/matricula
    faturas.ts         /alunos/{id}/faturas, /faturas/{id}, /pagamento, /faturas/avulsa
    agenda.ts          MOCK: relatório diário e lembretes (TODO(backend))
    perfil.ts          MOCK: faltas, atividades, sonecas e recados (TODO(backend))
  context/           AuthContext (sessão) e AlunosContext (alunos do responsável)
  hooks/             useAsyncResource (loading, erro, refresh)
  navigation/        RootNavigator (rotas protegidas) e MainTabs
  screens/           Login, AlterarSenha, SemConexao, Agenda, Perfil, Pagamentos, FaturaDetalhe
  components/        ui/ (genéricos, mascote), pagamentos/, perfil/, agenda/
  theme/             Cores (verde da marca #84CC3A), espaçamentos, raios, tipografia
  utils/             Formatação (pt-BR) e links externos
```

## Regras importantes da API

- `forma_pagamento` é minúsculo em `/faturas/avulsa` (`pix`/`boleto`) e MAIÚSCULO em `/faturas/{id}/pagamento` (`PIX`/`BOLETO`). A conversão fica só em `services/faturas.ts`.
- `pix_copia_cola` e `linha_digitavel` da fatura só vêm preenchidos depois de chamar `/pagamento`.
- Não há lista geral de faturas: o app busca as de cada aluno em paralelo.
- Login com `must_change_password = true` leva direto para a troca de senha (`PUT /senha`); o resto do app fica bloqueado até concluir.
- O excesso de tentativas de login volta como 422, não 429.
