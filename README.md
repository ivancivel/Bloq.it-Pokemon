# Bloq.it Frontend Challenge - Ultimate Pokedex

A robust, offline-first Pokedex application built with **React**, **TypeScript**, and modern web standards. This project focuses on performance, scalability, and a clean architectural separation of concerns.

## 🚀 Tech Stack & Rationale

I chose a stack that balances development speed with long-term maintainability and strict type safety.

- **Core:** React 18 + Vite (Fast HMR and tooling).
- **Language:** TypeScript (Strict mode enabled for maximum reliability).
- **Server State:** TanStack Query v5 (Handles caching, deduplication, and loading states).
- **Client State:** Zustand (Lightweight global state for filters/modals).
- **Persistence:** Dexie.js / IndexedDB (Robust offline storage for caught Pokémon).
- **Styling:** Tailwind CSS (Utility-first for rapid UI development and small bundle size).

## 🏗 Architecture & Design Decisions

### 1. Feature-Based Folder Structure

Instead of grouping by file type (e.g., all components in one folder), I utilized a **Domain-Driven/Feature-Based** structure.

- **Benefit:** Scalability. If we delete the `features/pokedex` folder, we remove all logic, components, and state related to that feature without leaving "zombie code" behind.
- **Structure:**
  ```text
  src/features/pokemon-explorer/
  ├── components/  # UI specific to the explorer
  ├── services/    # API calls and Adapters
  ├── hooks/       # Logic and Data fetching hooks
  └── types/       # TypeScript interfaces
  ```

### 2. The Repository & Adapter Pattern

Directly consuming the PokéAPI response in UI components creates tight coupling. To solve this, I implemented an **Adapter Layer**:

- **Raw Data:** Comes from the API (often deeply nested or with messy types).
- **Adapter:** Transforms raw data into a clean `Pokemon` domain entity.
- **UI:** Only interacts with the clean `Pokemon` interface.
- **Benefit:** If the API changes (or if we switch to GraphQL later), we only update the Adapter, not the React components.

### 3. Handling the "N+1" Problem (REST API Strategy)

The PokéAPI REST endpoints separate the "list" (names/URLs) from the "details" (images/types). This inherently creates an N+1 problem (1 request for the list + N requests for details).

- **My Solution:** I utilized `Promise.all` within the service layer to parallelize the detail requests.
- **Performance:** Modern browsers (HTTP/2) handle parallel requests efficiently.
- **Trade-off:** While a **GraphQL** approach would solve the over-fetching and N+1 issue natively (fetching everything in a single query), I opted for the **REST** implementation to strictly follow the challenge documentation link and to demonstrate capability in handling asynchronous data orchestration and waterfalls manually.

### 4. Offline-First Approach

To meet the requirement of "limited internet connectivity", I chose **IndexedDB** (via Dexie.js) over `localStorage`.

- **Why?** LocalStorage is synchronous (blocks the main thread) and limited to ~5MB. Storing base64 images or thousands of Pokémon would crash the app. IndexedDB is asynchronous and handles large datasets efficiently.

### 5. Search & Filtering Strategy (The "Smart Index" Pattern)

Implementing a "Live Search" (autocomplete) presented a challenge because the PokéAPI REST endpoints do not support partial string matching (e.g., searching for "pi" returns 404, not "Pikachu").

**Options Considered:**

1.  **Server-Side Search:** Impossible due to API limitations mentioned above.
2.  **Brute Force Loading:** Fetching details for all 1300+ Pokémon to filter locally would trigger rate limits and consume excessive user bandwidth (~1300 HTTP requests).

**Selected Solution: The "Lightweight Index"**
I implemented a hybrid approach to ensure instant feedback with minimal network cost:

- **Initialization:** On the first search interaction, the app fetches a **lightweight list** of _all_ Pokémon names/URLs (`limit=10000`). This payload is tiny (~100kb gzipped) and fast to download.
- **Client-Side Filtering:** The app filters this list of names in memory (extremely fast).
- **Lazy Detail Fetching:** Once the filtered list of names is ready (e.g., 50 matches for "pika"), the app resolves the details (images/stats) **only for the visible results** (paginated), reusing the existing Adapter pattern.

**Result:** Instant search feedback (0ms latency) without overloading the device or the API.


6. Logging Strategy (The Facade Pattern)
   You might ask: "Why build a custom logger instead of using a library like Winston or Pino?"

Context Awareness: Those libraries are industry standards for Node.js backends, but they add unnecessary bloat (10KB+) to a Frontend bundle where every kilobyte counts.

The Solution: I implemented a lightweight (<1KB, Zero Dependencies) Logger Facade.

Abstraction: The application depends on the logger interface, not on console.log directly.

Scalability: This provides a single point of integration. If we need to add Sentry or Datadog for production monitoring later, we only modify src/lib/logger.ts, and the entire application automatically starts reporting errors without refactoring a single component.

## 🛠 Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

3.  **Run tests (Coming Soon):**
    ```bash
    npm run test
    ```

---

_Developed by Ivan Zarro_
