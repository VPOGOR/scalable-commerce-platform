# Scalable Commerce Platform — Development Log

> Цей документ оновлюється після кожного кроку розробки.
> Мета: зафіксувати що зроблено, чому саме так, які залежності використані і яка логіка рішень.

---

## Зміст

1. [Загальна мета проекту](#1-загальна-мета-проекту)
2. [Відповідність PDP цілям](#2-відповідність-pdp-цілям)
3. [Архітектурні рішення](#3-архітектурні-рішення)
4. [Стек технологій](#4-стек-технологій)
5. [Структура проекту](#5-структура-проекту)
6. [Крок за кроком — що зроблено](#6-крок-за-кроком--що-зроблено)
7. [Залежності та пояснення вибору](#7-залежності-та-пояснення-вибору)
8. [Що планується далі](#8-що-планується-далі)

---

## 1. Загальна мета проекту

**Назва:** Scalable Commerce Platform
**Тип:** Мікрофронтенд монорепозиторій для e-commerce платформи
**Ціль:** Демонстрація навичок рівня P3 Front-End Engineer відповідно до PDP

Проект охоплює:
- Мікрофронтендову архітектуру через Module Federation
- Shared типи між усіма застосунками
- Спостережуваність (observability) — Web Vitals, логування
- CI/CD pipeline — Docker, GitHub Actions
- Безпеку — CORS, CSP, Auth
- Продуктивність — code splitting, lazy loading, bundle optimization

---

## 2. Відповідність PDP цілям

| PDP Компетентність | Що реалізується в проекті | Статус |
|---|---|---|
| A. Design & Architecture | Monorepo, Module Federation, shared packages | 🟡 В процесі |
| B. Network & Performance | CDN headers, HTTP caching, bundle optimization | ⬜ Заплановано |
| C. Observability | Web Vitals, Prometheus, Grafana | ✅ Крок 6 |
| D. Microfrontend Architecture | host + catalog + cart + auth apps | ✅ Кроки 3–4 |
| E. Project Lifecycle & Types | Shared TypeScript interfaces (@repo/types) | ✅ Кроки 1–2 |
| F. Browser Performance | Code splitting, lazy loading, reflow audit | ⬜ Заплановано |
| G. Security | CORS, CSP, JWT/OAuth, cookie config | ✅ Крок 7 |
| H. CI/CD & Deployment | GitHub Actions, Docker, Kubernetes | 🟡 В процесі (CI + Docker ✅) |
| I. Leadership & Mentorship | Документація, ADR, tech talk матеріали | 🟡 В процесі |

---

## 3. Архітектурні рішення

### Чому Monorepo?

Monorepo (один репозиторій для всього проекту) обраний тому що:
- Shared пакети (`@repo/types`, `@repo/ui`) використовуються в усіх застосунках без публікації в npm
- Єдиний `tsconfig`, `eslint` конфіг — консистентність між командами
- Turbo дозволяє паралельний build/lint тільки для змінених пакетів (incremental builds)
- Спрощує рефакторинг: зміна типу в `@repo/types` одразу видна у всіх застосунках

**Альтернатива:** Polyrepo (окремі репо для кожного сервісу) — складніше синхронізувати типи та версії залежностей.

### Чому Vite + Module Federation?

- **Vite** — найшвидший dev server (ESM-based, HMR за мілісекунди), підтримує TypeScript нативно
- **@originjs/vite-plugin-federation** — реалізація Webpack Module Federation для Vite
- Module Federation дозволяє завантажувати компоненти з окремих застосунків **в runtime**, без перебудови host app

**Альтернатива:** iframe-based microfrontends — простіша ізоляція, але складна комунікація та поганий UX.

### Чому Turbo?

- Кешує результати build/lint/test — не перераховує незмінені пакети
- Визначає граф залежностей: `host` залежить від `@repo/types` → будує спочатку types
- `turbo.json` описує pipeline задач з їхніми залежностями
- **Альтернатива:** Nx — потужніший, але складніший для невеликих команд

---

## 4. Стек технологій

| Технологія | Версія | Роль | Причина вибору |
|---|---|---|---|
| React | 19.2.0 | UI framework | Актуальна LTS версія, React Server Components ready |
| TypeScript | 5.9.3 | Типізація | Strict mode, shared interfaces між FE і BE |
| Vite | 7.x | Build tool | Найшвидший dev server, ESM-native |
| Turbo | 2.x | Monorepo orchestrator | Incremental builds, task pipeline |
| @originjs/vite-plugin-federation | 1.4.x | Module Federation | Runtime sharing компонентів між apps |
| Node.js | 22.x | Runtime | LTS версія, підтримка ES modules |

---

## 5. Структура проекту

```
scalable-commerce-platform/
│
├── apps/                          # Усі застосунки
│   ├── host/                      # Shell app (container) — порт 3001
│   │   └── src/
│   │       ├── App.tsx            # Завантажує remote компоненти через lazy()
│   │       └── main.tsx
│   │
│   ├── catalog/                   # MFE: каталог товарів — порт 3002
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Header.tsx
│   │       │   ├── ProductCard.tsx    # Тепер використовує ProductSummary з @repo/types
│   │       │   └── ProductList.tsx    # Тепер використовує ProductSummary[] з @repo/types
│   │       └── App.tsx
│   │
│   ├── cart/                      # MFE: кошик — порт 3003 [ЗАПЛАНОВАНО]
│   ├── auth/                      # MFE: авторизація — порт 3004 [ЗАПЛАНОВАНО]
│   └── admin/                     # MFE: адмін панель — порт 3005 [ЗАПЛАНОВАНО]
│
├── packages/                      # Shared пакети
│   ├── types/                     # @repo/types — TypeScript інтерфейси ✅
│   │   └── src/
│   │       ├── product.ts         # Product, ProductVariant, ProductCategory, ProductImage
│   │       ├── cart.ts            # Cart, CartItem, CartTotals
│   │       ├── user.ts            # User, AuthUser, UserRole, LoginCredentials
│   │       ├── order.ts           # Order, OrderItem, OrderStatus, Address
│   │       ├── api.ts             # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │       └── index.ts           # Barrel export усіх типів
│   │
│   ├── ui/                        # @repo/ui — Design system компоненти
│   ├── eslint-config/             # @repo/eslint-config
│   └── typescript-config/         # @repo/typescript-config
│
├── services/                      # Backend сервіси [ЗАПЛАНОВАНО]
│   ├── product-service/           # REST API для товарів (Node.js/Express)
│   ├── auth-service/              # Auth сервіс (JWT)
│   └── order-service/             # Сервіс замовлень
│
├── .github/                       # CI/CD [ЗАПЛАНОВАНО]
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docker-compose.yml             # Локальне середовище [ЗАПЛАНОВАНО]
├── turbo.json                     # Turbo pipeline конфіг
├── package.json                   # Root workspace
└── DEV_LOG.md                     # Цей файл
```

---

## 6. Крок за кроком — що зроблено

---

### КРОК 0 — Початковий стан проекту

**Дата:** До початку активної розробки
**Гілка:** `main`

**Що було:**
- Turbo monorepo з двома застосунками: `host` і `catalog`
- Module Federation налаштовано: `catalog` експортує `ProductCard`, `ProductList`, `Header`; `host` їх споживає через `React.lazy()`
- Shared пакети: `@repo/ui` (Button, Card, Code), `@repo/eslint-config`, `@repo/typescript-config`
- Жодних typed interfaces, CI/CD, observability, security конфігурацій

**Проблеми:**
- Компоненти `ProductCard` і `ProductList` не мали shared типів — кожен застосунок визначав власні
- Не було `packages/types` — стандартної практики для monorepo
- Не було жодного іншого мікрофронтенду крім `catalog`

---

### КРОК 1 — Shared TypeScript інтерфейси (`@repo/types`)

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**
- Створено пакет `packages/types` з ім'ям `@repo/types`
- Визначено core доменні інтерфейси для всієї платформи:
  - `product.ts` — `Product`, `ProductVariant`, `ProductCategory`, `ProductImage`, `ProductSummary`
  - `cart.ts` — `Cart`, `CartItem`, `CartTotals`
  - `user.ts` — `User`, `AuthUser`, `UserRole`, `LoginCredentials`, `RegisterPayload`
  - `order.ts` — `Order`, `OrderItem`, `OrderStatus`, `Address`, `OrderSummary`
  - `api.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `PaginationMeta`, `RequestConfig`
  - `index.ts` — barrel export усіх типів

**Чому це важливо (PDP E — Project Lifecycle & Type Management):**
> "Design and maintain shared TypeScript interfaces across repositories"

Без shared типів кожен мікрофронтенд та backend сервіс визначає власні інтерфейси → розсинхронізація,
баги в runtime, дублювання коду. `@repo/types` є єдиним джерелом правди (single source of truth) для
всіх доменних моделей проекту.

**Як це працює:**
```typescript
// В будь-якому apps/* або packages/*:
import type { Product, ApiResponse } from '@repo/types';

// TypeScript одразу перевіряє відповідність типів
const response: ApiResponse<Product[]> = await fetchProducts();
```

**Конфігурація пакету:**
- `package.json` — `name: "@repo/types"`, exports через `./src/*.ts`
- `tsconfig.json` — extends `@repo/typescript-config/base.json` (без JSX, бо це pure types)
- Немає зовнішніх runtime залежностей — тільки TypeScript як devDependency

**Залежності які отримали цей пакет:**
- `apps/catalog` — типи для компонентів `ProductCard`, `ProductList`
- `apps/host` — типи для remote module declarations
- Майбутні: `apps/cart`, `services/product-service`

---

### КРОК 2 — Рефакторинг компонентів `catalog` і `host` під shared типи

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

1. Додано `"@repo/types": "*"` в `dependencies` `apps/catalog` і `apps/host`
2. **`ProductCard.tsx`** — пропс змінено з `{ title: string }` на `{ product: ProductSummary }`:
   - відображає `product.name` і `product.currency + product.price`
3. **`ProductList.tsx`** — пропс змінено з `{ products: string[] }` на `{ products: ProductSummary[] }`
4. **`catalog/App.tsx`** — mock дані структуровані як `ProductSummary[]` з повноцінними полями
5. **`host/remotes.d.ts`** — declaration modules тепер імпортують типи з `@repo/types`:
   ```typescript
   import type { ProductSummary } from '@repo/types';
   declare module 'catalog/ProductList' {
     const ProductList: ComponentType<{ products: ProductSummary[] }>;
   }
   ```
6. **`host/App.tsx`** — mock дані типізовані через `ProductSummary`, видалено `ProductCard` (single item)

**Чому це важливо:**
- `remotes.d.ts` — це місток між TypeScript і Module Federation. Без нього TypeScript не знає
  що повертає `import('catalog/ProductCard')`. Тепер типи синхронізовані між producer і consumer.
- TypeScript перевіряє сумісність props ще на етапі компіляції, не в runtime.

**Результат `tsc --noEmit` для `@repo/types`:** 0 помилок ✅

---

### КРОК 3 — Мікрофронтенд `cart` + Cross-MFE комунікація

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

1. Створено `apps/cart` — повноцінний мікрофронтенд (порт 3003)
2. Написано `src/store/cartStore.ts` — реактивний singleton store:
   - `add(product)` / `remove(itemId)` / `clear()` / `getItems()` / `getTotals()`
   - `subscribe(fn)` — повертає unsubscribe функцію (React useEffect pattern)
   - Диспатчить `cart:updated` CustomEvent при кожній зміні
   - Слухає `cart:add` CustomEvent від інших MFE (catalog)
3. Написано три компоненти з Module Federation exposes:
   - `CartIcon` — кнопка з червоним badge лічильником товарів
   - `CartDrawer` — side panel з переліком товарів, remove, checkout кнопка
   - `CartSummary` — блок з subtotal / tax / shipping / total
4. Оновлено `catalog/ProductCard` — додано кнопку "Add to Cart", яка диспатчить `cart:add`
5. Оновлено `host/vite.config.ts` — додано `cart` remote
6. Оновлено `host/remotes.d.ts` — декларації для CartIcon, CartDrawer, CartSummary
7. Оновлено `host/App.tsx` — nav bar з Header + CartIcon, основний контент з ProductList, CartDrawer overlay

**Ключове архітектурне рішення — CustomEvent API для Cross-MFE комунікації:**

```
catalog MFE                    cart MFE
─────────────                  ─────────────────────────
ProductCard                    cartStore (singleton)
  └─ onClick()                   └─ addEventListener('cart:add')
       └─ window.dispatchEvent        └─ cartStore.add(product)
            ('cart:add', product)          └─ notify() → CartIcon re-renders
```

**Чому CustomEvent, а не Redux/Zustand через shared module?**
- CustomEvent — браузерний нативний API, zero dependencies між MFE
- Альтернатива: expose `cartStore` як federated module → catalog імпортує store з cart
  → circular dependency ризик і жорстке coupling між MFE
- Альтернатива: Zustand у `@repo/ui` shared → але тоді стан прив'язаний до конкретної бібліотеки
- CustomEvent зберігає повну ізоляцію: catalog нічого не знає про cart, тільки про подію

**Реактивність без зовнішніх бібліотек:**
```typescript
// subscribe pattern — сумісний з React useEffect
useEffect(() => {
  return cartStore.subscribe((items) => setCount(items.length));
  // повертає unsubscribe → React викликає при unmount
}, []);
```

**Результат `tsc --noEmit` для `apps/cart`:** 0 помилок ✅

---

## 7. Залежності та пояснення вибору

### @originjs/vite-plugin-federation

**Що робить:** Реалізує Webpack Module Federation специфікацію для Vite.
**Чому не Webpack:** Vite значно швидший у dev режимі (ESM-based, no bundling in dev).
**Обмеження:** Build target має бути `esnext` для коректної роботи dynamic imports у federated modules.

```typescript
// catalog/vite.config.ts — REMOTE (producer)
federation({
  name: "catalog",
  filename: "remoteEntry.js",        // Entry point для host app
  exposes: {
    "./ProductCard": "./src/components/ProductCard.tsx",
  },
  shared: ["react", "react-dom"],    // Щоб не завантажувати react двічі
})

// host/vite.config.ts — HOST (consumer)
federation({
  name: "host",
  remotes: {
    catalog: "http://localhost:3002/remoteEntry.js",
  },
  shared: ["react", "react-dom"],
})
```

**Shared dependencies:** Якщо і host, і catalog завантажать власний `react` — буде два екземпляри React,
що призведе до помилок хуків. `shared: ["react", "react-dom"]` гарантує що завантажується тільки одна версія.

### Turbo pipeline

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],   // Спочатку збудуй залежності (^)
      "outputs": ["dist/**"]     // Кешуй ці папки
    }
  }
}
```

`^build` означає: перед build поточного пакету — виконай build усіх його залежностей.
Тобто `host` build запуститься тільки після того, як `@repo/types` і `@repo/ui` збудовані.

### @repo/types — чому `"*"` версія

У workspace монорепо `"@repo/types": "*"` означає "використовуй локальну версію з workspace".
npm/yarn/pnpm автоматично symlink-ує пакет — не потрібно публікувати в registry.
Змінюємо тип в `packages/types/src/product.ts` → усі apps одразу бачать зміну.

---

## 8. Що планується далі

### КРОК 4 — Мікрофронтенд `auth` + AuthGuard

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

1. Створено `apps/auth` — мікрофронтенд авторизації (порт 3004)
2. Написано `src/store/authStore.ts`:
   - `login(credentials)` / `register(payload)` / `logout()` — mock з 500ms затримкою (імітація мережі)
   - Стан зберігається в `localStorage` з перевіркою `expiresAt` при старті
   - `subscribe(fn)` — реактивний патерн, повертає unsubscribe
   - Диспатчить `auth:changed` CustomEvent для cross-MFE синхронізації
3. Написано чотири компоненти:
   - `LoginForm` — email/password форма з валідацією, loading стан, error handling
   - `RegisterForm` — форма реєстрації з firstName/lastName/email/password
   - `AuthGuard` — умовний рендер: показує LoginForm/RegisterForm або `children`
   - `UserMenu` — аватар з ініціалами, email, кнопка Logout
4. Оновлено `host/vite.config.ts` — додано `auth` remote (порт 3004)
5. Оновлено `host/remotes.d.ts` — декларації для всіх 4 auth компонентів
6. Оновлено `host/App.tsx` — `AuthGuard` обгортає ProductList; `UserMenu` в navbar
7. **Виправлено архітектурну помилку в `remotes.d.ts`:**
   - Top-level `import type` перетворює `.d.ts` файл на TypeScript "module"
   - В module `.d.ts` файлі `declare module` — це augmentation, а не ambient declaration
   - Рішення: перенести `import type` всередину кожного `declare module {}` блоку

**Auth flow в host:**
```
User відкриває host
  └─ AuthGuard рендериться
       ├─ authStore.isAuthenticated() → false → показує LoginForm
       │    └─ user заповнює форму → authStore.login() → localStorage → notify()
       │         └─ AuthGuard отримує callback → isAuth = true → рендерить children
       └─ isAuth = true → показує ProductList (захищений контент)

Navbar:
  UserMenu → authStore.getUser() → показує email + Logout button
```

**localStorage persistence:**
```typescript
// При старті authStore завантажує збережений стан
function loadFromStorage(): AuthUser | null {
  const parsed = JSON.parse(localStorage.getItem('auth:user') ?? 'null');
  if (parsed?.expiresAt < Date.now()) {
    localStorage.removeItem('auth:user'); // автоматичний logout при протермінованому токені
    return null;
  }
  return parsed;
}
```

**Результат `tsc --noEmit`:** 0 помилок у всіх apps ✅

---

### КРОК 5 — CI/CD: GitHub Actions + Docker + nginx

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

**GitHub Actions:**
- `.github/workflows/ci.yml` — запускається на кожен push/PR до `main`:
  - Node 22, `npm ci` (детерміністична установка)
  - Turbo cache між запусками (`actions/cache` → `.turbo/`)
  - 3 паралельні jobs через turbo pipeline: `lint` → `check-types` → `build`
- `.github/workflows/docker.yml` — будує Docker образи для всіх 4 apps:
  - Matrix strategy: `[host, catalog, cart, auth]` — паралельний build
  - GitHub Actions Cache (`type=gha`) для Docker layer cache

**Dockerfiles (multi-stage, кожен app):**
```
Stage 1: node:22-alpine (builder)
  ├─ COPY package*.json turbo.json  ← окремий шар, кешується до змін маніфестів
  ├─ COPY packages/                 ← shared packages (@repo/types тощо)
  ├─ COPY apps/<name>/              ← тільки потрібний app
  ├─ npm ci --ignore-scripts        ← детерміністична установка
  └─ turbo run build --filter=<app> ← build тільки потрібного app + залежностей

Stage 2: nginx:alpine (runner, ~25MB)
  ├─ COPY nginx.conf                ← конфіг SPA + кешування
  └─ COPY --from=builder dist/      ← тільки зібрана статика
```

**Чому multi-stage build:**
- builder (~800MB з node_modules) не потрапляє в фінальний образ
- runner (~25MB nginx + ~2MB статика) = продакшн образ
- `--filter=<app>` — turbo будує тільки необхідний підграф залежностей

**nginx.conf (однаковий для всіх apps):**
- `try_files $uri $uri/ /index.html` — SPA routing (React Router)
- `index.html` — `no-cache` (завжди свіжий після деплою)
- `*.js/*.css` — `Cache-Control: public, immutable, 1y` (vite додає content hash)
- `Access-Control-Allow-Origin: *` — **критично для Module Federation**:
  host завантажує `remoteEntry.js` з інших origins (3002, 3003, 3004)

**docker-compose.yml:**
```
catalog:3002 → cart:3003 → auth:3004 → host:3001 (depends_on)
```
Одна команда для запуску всього: `docker compose up --build`

**Відома обмеження (production consideration):**
Vite config має hardcoded `localhost:3002/3003/3004` URLs. У production
потрібно замінити на реальні домени через env vars:
```typescript
// vite.config.ts — production approach
remotes: {
  catalog: process.env.CATALOG_URL ?? "http://localhost:3002/remoteEntry.js",
}
```

**Також виправлено:**
- `apps/host/vite.config.ts` — додано `build.target: 'esnext'` (обов'язково для Module Federation)

**Результат `tsc --noEmit`:** 0 помилок ✅

### КРОК 6 — Observability: Web Vitals + Logger + ErrorBoundary + Prometheus/Grafana

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

**1. `web-vitals` інтеграція (`apps/host/src/utils/vitals.ts`):**
- Встановлено пакет `web-vitals@^4.2.4` — офіційна Google бібліотека
- Збираємо всі 5 Core Web Vitals: `LCP`, `CLS`, `TTFB`, `INP`, `FCP`
- `initVitals()` реєструє обробники через `onLCP/onCLS/onTTFB/onINP/onFCP`
- `subscribeToVitals(fn)` — pub-sub store для реактивного оновлення панелі
- В dev — логуємо в консоль, в prod — `navigator.sendBeacon('/api/metrics/vitals')`
- `Beacon API` (не `fetch`) — надійніший при закритті вкладки, не блокує рендер

**2. Structured Logger (`apps/host/src/utils/logger.ts`):**
```typescript
// Dev:  кольоровий консоль вивід
logger.info('Web Vital: LCP', { value: '1234ms', rating: 'good' })
// Prod: JSON рядок → збирається ELK Stack → індексується Kibana
// {"level":"info","message":"Web Vital: LCP","timestamp":"...","context":{...}}
```
- `logger.debug/info/warn/error` — уніфікований інтерфейс
- `import.meta.env.DEV` — умовна логіка без bundle в production

**3. `DevVitalsPanel` (`apps/host/src/components/DevVitalsPanel.tsx`):**
- Floating overlay, тільки в dev (`{import.meta.env.DEV && <DevVitalsPanel />}`)
- Відображає всі 5 метрик з кольоровим індикатором: 🟢 good / 🟡 needs-improvement / 🔴 poor
- Показує поточне значення і Core Web Vitals пороги (good / poor threshold)
- Реактивний: `subscribeToVitals` оновлює panel при кожному новому вимірюванні

**Core Web Vitals пороги (Google 2024):**
| Метрика | Good | Poor |
|---|---|---|
| LCP | < 2500ms | ≥ 4000ms |
| CLS | < 0.1 | ≥ 0.25 |
| TTFB | < 800ms | ≥ 1800ms |
| INP | < 200ms | ≥ 500ms |
| FCP | < 1800ms | ≥ 3000ms |

**4. `ErrorBoundary` (`apps/host/src/components/ErrorBoundary.tsx`):**
- React class component (тільки class component може бути ErrorBoundary)
- `componentDidCatch` → `logger.error(...)` зі structured context (для ELK/Kibana)
- Кожен MFE remote обгорнутий власним `<ErrorBoundary name="...">`:
  збій одного мікрофронтенду не кладе весь host app

**5. Prometheus + Grafana (`monitoring/`):**

Observability pipeline:
```
Browser → web-vitals → sendBeacon('/api/metrics/vitals')
  → metrics-service:4000 → GET /metrics ← Prometheus:9090 ← Grafana:3000
```
- `prometheus.yml` — scrape jobs: web-vitals + product-service + auth-service
- `docker-compose.yml` — Prometheus + Grafana з persisted volumes
- `grafana/provisioning/` — datasource і dashboard як код (IaC):
  Grafana стартує вже підключеною до Prometheus — нуль ручного налаштування

**Запуск:**
```bash
cd monitoring && docker compose up -d
# Prometheus:  http://localhost:9090
# Grafana:     http://localhost:3000  (admin/admin)
```

**Результат `tsc --noEmit`:** 0 помилок ✅

---

### КРОК 7 — Security: CSP + CORS + CSRF + Secure Token Pattern

**Дата:** 2026-04-18
**Статус:** ✅ Виконано

**Що зроблено:**

**1. nginx.conf — повний набір security headers (усі 4 apps):**

| Header | Значення | Захищає від |
|---|---|---|
| `X-Frame-Options` | SAMEORIGIN (host) / DENY (remotes) | Clickjacking |
| `X-Content-Type-Options` | nosniff | MIME-type sniffing → XSS |
| `Referrer-Policy` | strict-origin-when-cross-origin | Витоку URL у Referer |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() | Browser API abuse |
| `Content-Security-Policy` | Різна для host і remotes | XSS, injection |

**CSP стратегія — різна для host і remote MFEs:**
```nginx
# host (Module Federation consumer) — складніша CSP:
Content-Security-Policy:
  default-src 'self';
  script-src 'self' http://localhost:3002 http://localhost:3003 http://localhost:3004 'unsafe-eval';
  # 'unsafe-eval' потрібен: MF dynamic chunk evaluation
  # У production замінити localhost на CDN домени

# catalog / cart / auth (remote MFEs) — строга CSP:
Content-Security-Policy:
  default-src 'self';
  script-src 'self';           # нічого зовнішнього
  frame-ancestors 'none';      # DENY embedding
```

**2. Vite dev server headers:**
- `catalog/cart/auth`: `Access-Control-Allow-Origin: *` — для Module Federation в dev
- `host`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

**3. `packages/types/src/security.ts` — нові типи:**
- `HttpMethod`, `CsrfToken`, `SecurityHeaders`, `SecureRequestConfig`, `TokenPair`

**4. `apps/host/src/utils/security.ts` — CSRF + secureFetch:**
```typescript
// Double-submit cookie pattern:
//   1. Client генерує токен → cookie (SameSite=Strict, НЕ HttpOnly)
//   2. Client надсилає токен в X-CSRF-Token header
//   3. Сервер перевіряє: cookie === header
//   (XSS може читати cookie, але cross-site request не може → CSRF захист)

export function getCsrfToken(): string { ... }
export function getCsrfHeaders(): Record<string, string> { ... }

// URL sanitization: блокує javascript: і data: schemes
export function sanitizeUrl(url: string): string { ... }

// Fetch wrapper: автоматично додає CSRF headers + credentials: same-origin
export async function secureFetch(url: string, options: RequestInit): Promise<Response> { ... }
```

**5. `authStore.ts` — secure token pattern з документацією:**

```
ПОТОЧНО (demo):   refreshToken + accessToken → localStorage
PRODUCTION:
  accessToken  → тільки в пам'яті (JS variable)  ← XSS не пробереться через перезавантаження
  refreshToken → HttpOnly cookie (сервер Set-Cookie) ← JS взагалі не читає
  user data    → localStorage (не секретно)

Refresh flow:
  accessToken expired → GET /api/auth/refresh (cookie автоматично)
    → новий accessToken в пам'ять
```

Додано `authStore.getAccessToken()` — читає з пам'яті, не з localStorage.

**HSTS — не активовано:**
```nginx
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
# Вмикати ТІЛЬКИ з HTTPS — інакше заблокує сайт на рік без SSL
```

**Результат `tsc --noEmit`:** 0 помилок у всіх packages і apps ✅

---

### КРОК 8 — Backend сервіси (2026-04-18)

#### Що зроблено

Створено два Node.js мікросервіси з повним TypeScript strict-mode.

**Нові файли:**
```
services/
  product-service/
    package.json          — ESM, залежності: express, cors, @repo/types
    tsconfig.json         — extends @repo/typescript-config/node-service.json
    Dockerfile            — multi-stage: builder (tsc) → runner (node:22-alpine)
    src/
      data/products.ts    — 6 seed-продуктів з повними даними
      middleware/
        cors.ts           — CORS allowlist: localhost 3001-3004
        requestLogger.ts  — structured JSON logs (method, path, status, ms)
      routes/products.ts  — GET /products (paginated, ?category filter), GET /products/:id
      index.ts            — Express + /health + /metrics (Prometheus format)
  auth-service/
    package.json          — ESM, залежності: express, cors, cookie-parser, @repo/types
    tsconfig.json         — extends @repo/typescript-config/node-service.json
    Dockerfile            — multi-stage builder → runner
    src/
      utils/jwt.ts        — HS256 JWT (Node crypto, без залежностей), constant-time compare
      middleware/
        cors.ts           — CORS allowlist
        csrf.ts           — double-submit cookie validation (x-csrf-token header vs cookie)
      routes/auth.ts      — POST /login, /register, /refresh, /logout; GET /me
      index.ts            — Express + cookieParser + /health + /metrics
```

**Змінено:**
- `package.json` (root) — додано `"services/*"` до workspaces
- `packages/typescript-config/node-service.json` — новий пресет для Node.js сервісів
- `docker-compose.yml` — додано `product-service:4001` та `auth-service:4002`

#### Чому саме так

**`@repo/types` у сервісах** — той самий пакет типів що і у frontend MFEs. Якщо `ProductSummary` або `ApiResponse<T>` змінюється — TypeScript одразу покаже де зламалось. Zero runtime desync.

**Ручна JWT реалізація (без jsonwebtoken):**
- Нуль зовнішніх залежностей у критичному security-коді
- Constant-time comparison (`diff |= charCode XOR`) — захист від timing attacks
- Production TODO задокументований: RS256 з ротованими ключами

**HttpOnly cookie для refresh token:**
```
POST /auth/login → accessToken у body + refresh_token у Set-Cookie (httpOnly, sameSite=strict)
POST /auth/refresh → читає cookie → повертає новий accessToken
POST /auth/logout → csrfProtection middleware → clearCookie
```
JavaScript не може прочитати refresh_token — XSS не може вкрасти його.

**SameSite=Strict на /auth/refresh** — cookie не надсилається з cross-site запитів, тому CSRF атака через `<img src="...">` не дає refresh_token. Є достатнім захистом для /refresh endpoint.

**CSRF double-submit на /logout** — mutation endpoint з side-effect (видалення сесії) вимагає явного `x-csrf-token` header який клієнт встановлює з `csrf_token` cookie. Cross-site JS не може прочитати cookie і не може виставити правильний header.

**Prometheus /metrics у text format:**
```
# HELP auth_service_up Service availability
# TYPE auth_service_up gauge
auth_service_up 1
process_uptime_seconds 42.15
```
Сумісно з Prometheus scrape config без додаткових бібліотек.

**Docker multi-stage для сервісів:**
```
builder: node:22-alpine → npm ci → tsc → /dist
runner:  node:22-alpine → копіює dist + package.json → npm install --omit=dev
```
Фінальний образ ~80MB (без devDependencies, tsx, TypeScript).

#### Залежності

| Пакет | Причина |
|-------|---------|
| `express@^4.21` | Зрілий HTTP framework, мінімальний overhead |
| `cors@^2.8` | Whitelist-based CORS middleware |
| `cookie-parser@^1.4` | Читає `req.cookies` як типізований об'єкт |
| `tsx@^4.19` (dev) | Запускає `.ts` напряму в dev без зміни import paths |
| `@types/express`, `@types/cors`, `@types/cookie-parser` | TypeScript declarations |

#### Результат type-check

```bash
npx tsc --noEmit -p services/product-service/tsconfig.json  # 0 помилок ✅
npx tsc --noEmit -p services/auth-service/tsconfig.json     # 0 помилок ✅
```

---

*Останнє оновлення: 2026-04-18 — Крок 8: product-service, auth-service, Dockerfiles, docker-compose*
