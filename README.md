# Centopeia — App do Responsável

App mobile (iOS e Android) para responsáveis/pais acompanharem a rotina escolar dos filhos: agenda diária, lembretes, perfil e pagamentos. Consome a API de um backend Laravel 12 já existente (papéis admin/professor ficam no painel web; este app é exclusivo para o papel **responsável**).

Este repositório está nesta fase: **estrutura, navegação, tipos e telas com dados mockados**, prontos para trocar por chamadas reais assim que a API estiver disponível. Integração real com o backend e com o Asaas (pagamentos) ainda não foi implementada.

## Stack

- [Expo](https://expo.dev) (SDK 57) + TypeScript
- [React Navigation](https://reactnavigation.org) — stack (autenticação) + bottom tabs (Agenda / Perfil / Pagamentos)
- Axios com interceptor de token (`src/api/client.ts`)
- Context API para autenticação e filho selecionado
- `expo-secure-store` para persistir o token com segurança
- `@react-native-async-storage/async-storage` disponível para persistência simples adicional

## Como rodar

Pré-requisitos: Node.js 20.19+ (o projeto roda em 20.18 também, mas o Expo emite um aviso de versão desatualizada) e o app **Expo Go** no celular, ou um emulador Android / simulador iOS.

```bash
npm install
npx expo start
```

Depois escaneie o QR code com o Expo Go (Android) ou a câmera (iOS), ou pressione `a`/`i` no terminal para abrir num emulador/simulador.

Login mockado: qualquer e-mail, senha `123456` (já preenchido por padrão na tela de login).

### Apontando para o backend real

Toda a camada de API já está pronta, só falta ligar o endpoint real:

1. Copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL` para a URL da sua API Laravel (ex.: `https://api.suaescola.com.br/api`).
2. Em `src/api/config.ts`, mude `USE_MOCKS` para `false`.
3. Pronto — cada função em `src/api/*.ts` já tem o branch de chamada real via `apiClient` (axios), só o mock deixa de ser usado.

## Estrutura de pastas

```
src/
  api/            Camada de API centralizada
    client.ts       Instância axios + interceptor de token (Authorization: Bearer)
    config.ts       URL base, flag USE_MOCKS, delay simulado dos mocks
    tokenStorage.ts  Leitura/escrita do token no SecureStore
    auth.ts          POST /login, GET /me
    children.ts      GET /children
    dailyReports.ts  GET /children/{id}/daily-reports
    reminders.ts     GET /reminders
    profile.ts       GET /children/{id}/profile, GET /children/{id}/recados
    payments.ts      GET /children/{id}/invoices, POST /payments/checkout

  screens/        Uma tela por arquivo
    LoginScreen.tsx
    ChildSelectorScreen.tsx
    AgendaScreen.tsx
    PerfilScreen.tsx
    PagamentosScreen.tsx

  components/
    ui/             Componentes genéricos (Card, Button, Pill, ScreenContainer, LoadingView, EmptyState)
    agenda/         DailyReportCard, RemindersList, labels dos enums
    perfil/         ChildHeader, StatGrid, RecadoCard

  navigation/
    RootNavigator.tsx  Decide entre Login → Seleção de filho → Tabs, conforme o estado de auth
    MainTabs.tsx        Bottom tabs: Agenda / Perfil / Pagamentos
    types.ts             Tipos das param lists

  context/
    AuthContext.tsx    login, logout, usuário logado, bootstrap de sessão a partir do token salvo
    ChildContext.tsx   Lista de filhos do responsável e filho atualmente selecionado

  types/
    index.ts        Tipos espelhando o contrato de API (ver abaixo)

  mocks/
    data.ts          Dados mockados usados enquanto USE_MOCKS = true

  theme/
    colors.ts        Paleta de cores (inspirada no protótipo de referência) e tokens de espaçamento/raio

  utils/
    format.ts        Formatação de data/moeda/idade
    delay.ts          Helper para simular latência de rede nos mocks
```

## Fluxo de navegação

```
Login  →  (se houver mais de 1 filho) Seleção de filho  →  Tabs (Agenda | Perfil | Pagamentos)
```

- O token fica em `expo-secure-store`; ao abrir o app, `AuthContext` tenta restaurar a sessão chamando `GET /me`.
- Se a API responder 401 em qualquer chamada, o interceptor do axios limpa o token e o usuário volta para o Login.
- `ChildContext` carrega os filhos do responsável após o login; se houver só um filho, ele é selecionado automaticamente e a tela de seleção é pulada.

## Telas

1. **Login** — e-mail e senha do responsável.
2. **Seleção de filho** — aparece quando o responsável tem mais de um filho matriculado.
3. **Agenda** — relatório diário do professor (alimentação, sono, higiene, humor, atividades, observações) com navegação entre dias, e seção de lembretes (feriados / aulas extras).
4. **Perfil** — dados do filho, cards de Faltas / Atividades / Sonecas (quantidade + duração média) e lista de Recados (título, mensagem, data, autor).
5. **Pagamentos** — card de próximo vencimento com botão "Pagar agora" (chama `POST /payments/checkout`, hoje mockado) e histórico de mensalidades/matrícula com status Pago / Pendente / Atrasado.

## Contrato de tipos (`src/types/index.ts`)

Os tipos espelham exatamente o shape de API combinado:

- `POST /login`, `GET /me` → `User`, `LoginRequest`, `LoginResponse`
- `GET /children` → `Child[]`
- `GET /children/{id}/daily-reports?date=YYYY-MM-DD` → `DailyReport`
- `GET /reminders?tipo=feriado|aula_extra` → `Reminder[]`
- `GET /children/{id}/profile` → `ChildProfile` (`faltas`, `atividades_count`, `sonecas: { quantidade, duracao_media }`)
- `GET /children/{id}/recados` → `Recado[]`
- `GET /children/{id}/invoices` → `Invoice[]`
- `POST /payments/checkout` → `PaymentCheckoutResponse`

## Próximos passos (fora do escopo deste commit)

- Integração real com a API Laravel (trocar `USE_MOCKS` por `false` endpoint a endpoint).
- Integração real de pagamento com Asaas na tela de Pagamentos.
- Push notifications para novos recados/relatórios diários.
