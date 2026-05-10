## Project Structure

```bash
scalable-commerce-platform/
│
├── apps/                     # All apps (frontend + backend)
│
│   ├── host/                # Shell / Container app
│   │   ├── src/
│   │   │   ├── app/          # Layout, router
│   │   │   ├── federation/   # Config remote apps
│   │   │   ├── providers/    # QueryClient, Theme, Auth
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   │
│   ├── catalog/              # Micro-frontend: goods catalog
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   └── product-list/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── App.tsx
│   │   └── vite.config.ts
│   │
│   ├── cart/                 # Micro-frontend: bucket
│   │   ├── src/
│   │   │   ├── store/
│   │   │   ├── components/
│   │   │   └── App.tsx
│   │
│   ├── admin/                # Micro-frontend: admin panel
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── charts/
│   │   │   └── App.tsx
│   │
│   ├── auth/                 # Micro-frontend: login/register
│   │
│   ├── auth-service/         # Backend: NestJS auth
│   ├── product-service/      # Backend: goods
│   └── order-service/        # Backend: orders
│
├── packages/                 # Shared packages (components, utils, types)
│
│   ├── ui/                   # Design system
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   │
│   ├── shared-types/         # TypeScript types/interfaces
│   │   └── product.ts
│   │
│   └── config/               # eslint, tsconfig, shared config
│
├── docker-compose.yml
├── turbo.json
└── package.json
```
