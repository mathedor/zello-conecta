# Zello Conecta

Marketplace de serviços profissionais — web + apps iOS/Android.

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Web**: Next.js 15 (App Router) + Tailwind + shadcn/ui
- **Mobile**: Expo (React Native) + NativeWind
- **Banco**: Postgres (Neon) + Prisma
- **Auth**: Auth.js (NextAuth v5)
- **Pagamentos**: Stripe (cartão) + Efí Bank (PIX)
- **Notificações**: Resend (email) + Twilio (SMS) + Expo Push
- **Storage**: Vercel Blob
- **Deploy**: Vercel (web) + EAS (mobile)

## Estrutura

```
zello-conecta/
├── apps/
│   ├── web/          → Next.js (site institucional + sistema + admin)
│   └── mobile/       → Expo (apps nativos iOS/Android)
└── packages/
    ├── db/           → Prisma schema + cliente
    ├── auth/         → Configuração compartilhada Auth.js
    ├── ui/           → Componentes compartilhados
    ├── payments/     → Stripe + Efí
    ├── notifications/→ Resend + Twilio + Expo Push
    ├── validators/   → Schemas Zod
    └── types/        → Tipos TypeScript globais
```

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm dev
```

## Modelo de negócio

- Profissionais vendem serviços por hora ou empreitada
- Plataforma cobra **20%** sobre cada venda
- Pagamento retido em escrow por 48h após o término do serviço
- Saque manual via solicitação à administração
