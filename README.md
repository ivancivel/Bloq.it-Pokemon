# Bloq.it Frontend Challenge — Ultimate Pokédex

A robust, **offline‑first Pokédex** application built with **React**, **TypeScript**, and modern web standards. This project focuses on **performance**, **scalability**, and a **clean architectural separation of concerns**.

---

## Tech Stack & Rationale

I chose a stack that balances **development speed**, **long‑term maintainability**, and **strict type safety**.

- **Core:** React 18 + Vite  
  _Fast HMR, modern tooling, and excellent DX._
- **Language:** TypeScript (Strict Mode)  
  _Maximum reliability and early error detection._
- **Server State:** TanStack Query v5  
  _Caching, deduplication, infinite scrolling, and resilient loading states._
- **Client State:** Zustand  
  _Lightweight global state for filters and modals._
- **Persistence:** Dexie.js / IndexedDB  
  _Robust offline storage for caught Pokémon and images._
- **Styling:** Tailwind CSS  
  _Utility‑first styling for rapid UI development and small bundle size._
- **Testing:** Vitest + React Testing Library  
  _Integration‑first testing approach._

---

## Architecture & Design Decisions

### 1. Hybrid Feature-Based Architecture

The project follows a **Domain‑Driven** structure, separating "Feature" code from "Shared" code.

- **Features (`src/features/`):** Contains logic, state, and UI specific to a domain (e.g., Pokedex, Explorer). If a feature is deleted, its code vanishes cleanly.
- **Shared (`src/components/`):** Reusable UI atoms/molecules used across multiple features (e.g., `PokemonCard`, `CatchButton`).

**Structure Overview:**

```text
src/
├── components/          # Shared UI (Buttons, Cards, Inputs)
└── features/
    └── pokemon-explorer/
        ├── components/  # UI specific ONLY to this feature
        ├── services/    # API calls and adapters
        ├── hooks/       # Business logic & data‑fetching
        └── types/       # TypeScript interfaces
```

### 2. Repository & Adapter Pattern

Directly consuming PokéAPI responses inside UI components creates tight coupling.

**Solution:** An explicit **Adapter Layer**.

- **Raw Data:** API responses (deeply nested, unstable schemas)
- **Adapter:** Transforms raw data into a clean `Pokemon` domain entity
- **UI:** Only interacts with the domain model

**Benefit:**
If the API changes — or if the app switches to GraphQL — only the adapter layer needs updating.

---

### 3. Pagination & Server State Strategy

The PokéAPI separates **lists** from **details**, which can easily cause N+1 performance issues.

**Solution:**

- `useInfiniteQuery` from TanStack Query
- Offset‑based cursor strategy
- Chunked fetching (20 Pokémon per request)

**Resilience (Graceful Degradation):**
If 1 out of 20 Pokémon requests fails:

- The UI **does not crash**
- A warning is logged
- The remaining 19 Pokémon are rendered

Result: uninterrupted user experience, even under unstable networks.

---

### 4. Offline‑First Persistence Strategy

To support **limited or unstable connectivity**, IndexedDB (via Dexie.js) was chosen over `localStorage`.

**Why IndexedDB?**

- Asynchronous (non‑blocking)
- Handles large datasets efficiently
- Suitable for images and thousands of records
- Supports indexed queries and sorting

`localStorage` is synchronous, size‑limited (~5MB), and unsuitable for this use case.

---

### 5. Search & Filtering — The “Smart Index” Pattern

PokéAPI does not support partial string search.

**Implemented Solution:** A hybrid **Lightweight Index** strategy.

**Phase 1 — Index Fetch**

- Fetches a lightweight list of all Pokémon names/URLs (`limit=10000`)
- ~100KB gzipped
- Cached indefinitely (`staleTime: Infinity`)

**Phase 2 — Client‑Side Filtering**

- In‑memory filtering
- ~10,000 items filtered in <10ms

**Phase 3 — Lazy Hydration**

- Fetch details only for visible, paginated results
- Reuses the Adapter layer

**Result:**
Instant, zero‑latency search feedback without overwhelming the API.

---

### 6. Logging Strategy — Facade Pattern

Heavy logging libraries (Winston, Pino) are not browser‑friendly.

**Solution:**
A custom **Logger Facade** (<1KB).

**Benefits:**

- App depends on an interface, not `console.log`
- Easy integration with Sentry, Datadog, etc.
- Single‑file swap: `src/lib/logger.ts`

---

### 7. Optimistic UI & Rollback

To ensure a **native‑like**, responsive feel:

- Catching a Pokémon updates the UI **immediately** (optimistic update)
- Database writes happen asynchronously

**Safety Net:**
If IndexedDB fails (e.g. storage full):

- UI state is automatically rolled back
- Error is logged via the Logger facade

---

### 8. Data Fusion — Pokémon Details View

The Details View acts as a **traffic controller** between multiple data sources:

- **Discovery Mode:** API data only
- **Owner Mode:** Local DB data (capture date, offline images)
- **Shared View:** Forces API data (`?caughtAt=...`) to ensure neutrality

This guarantees consistent and predictable data rendering.

---

## 9. Security & Data Integrity (Defense in Depth)

The application implements multiple layers of protection to ensure user data safety and system resilience:

### 1. Runtime Type Safety (Zod)

While TypeScript provides compile-time checks, we utilize **Zod** in the `pokedex.store.ts` to perform strict **Runtime Validation**. Every Pokémon object is validated against a schema before it is persisted in IndexedDB. This prevents:

- "Poisoned" data injection via the browser console.
- API anomalies from polluting the local database.
- Inconsistent data states in the UI.

### 2. Content Security Policy (CSP)

A strict **CSP** is implemented via a Meta Tag in `index.html` to act as a final browser-level safeguard:

- **XSS Protection:** Disables inline script execution.
- **Data Exfiltration Prevention:** Restricts network requests (`connect-src`) strictly to the official PokéAPI domain.
- **Image Source Control:** Whitelists only trusted domains (GitHub, TeamTailor) and local `data:` URIs for offline images.

### 3. CSV Injection Prevention

The `csv-export.ts` utility implements a sanitization layer that neutralizes potentially malicious characters (like `=`, `+`, `-`, `@`) in user-generated content (notes) before generating the export file.

### 4. Input Sanitization

User-generated notes are strictly sanitized:

- **Trimming:** Removes unnecessary whitespace.
- **Size Limiting:** Enforces a `MAX_NOTE_LENGTH` (200 chars) to prevent database bloating and UI overflow attacks.

---

## Testing Strategy

The project includes **48 automated tests (100% passing)**, prioritizing **integration and logic validation**

### Key Coverage Areas

- **Core Logic:**
  - Catch button state transitions
  - Pokédex collection filtering & sorting

- **Resilience:**
  - Network failure recovery
  - Graceful degradation scenarios

- **Security:**
  - CSV export sanitization (CSV Injection prevention)

- **Data Integrity:**
  - IndexedDB rollback mechanisms
  - Duplicate Pokémon prevention

- **Browser APIs:**
  - Clipboard API
  - FileReader
  - IndexedDB

### Run tests

```bash
npm test
```

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

---

### 📱 Environment & Device Compatibility

The application has been manually tested and verified in the following environments to ensure a consistent user experience:

- **Desktop:**
  - **Google Chrome** (macOS): Full compatibility with IndexedDB and PWA features.
  - **Safari** (macOS): Verified rendering and smooth animations.
- **Mobile:**
  - **iPhone (iOS Safari):** Optimized for touch interactions and mobile responsiveness.

_Note: Due to hardware unavailability, the project has not been physically tested on **Android** devices. However, standard browser compatibility was prioritized to ensure broad support across modern mobile browsers._

## Author

Developed by **Ivan Zarro**
