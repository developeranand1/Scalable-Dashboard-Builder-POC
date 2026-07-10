# Architectural Decision Record (ADR)

This document details the architectural decisions and technology choices made for the Scalable Dashboard Builder Proof of Concept (POC).

---

## 1. Frontend State Management: Zustand

### Context
A dashboard builder manages complex nested state, including:
1. Widget configurations (options, titles, types).
2. Layout coordinates (grid positions: x, y, width, height) which change frequently during dragging/resizing.
3. Fetching states (isolated loading, connection failures) on a per-widget basis.

### Decision
We chose **Zustand** as our global state store instead of Redux Toolkit or raw React Context.

### Rationale
- **Fine-grained Selectors**: Zustand allows components (e.g. `WidgetContainer` or chart items) to subscribe to exact slices of state (e.g. just `state.widgetData[id]`). This prevents the entire dashboard from re-rendering when only a single widget receives data or changes loading status.
- **Decoupled Actions**: Layout resizing in `react-grid-layout` triggers frequent callbacks. Using React Context causes major render-loops because any state change updates the provider value and forces all child nodes to redraw. Zustand skips React context provider boundaries entirely, keeping state transitions lightning-fast.
- **Low Boilerplate**: Zustand has a tiny footprint and simple hook-based API, enhancing developer speed and DX.

---

## 2. Visualization Engine: Recharts

### Context
The POC requires at least 4 distinct chart types (Categorical, Temporal, Hierarchical, Relational) with responsive layouts that automatically adjust as cards resize.

### Decision
We chose **Recharts** as the charting library.

### Rationale
- **Native SVG & React Components**: Recharts is built specifically for React, rendering charts as declarative SVG elements. This makes customizing tooltips, axes, grids, and legends using inline JSX extremely simple.
- **Responsive Sizing**: The library includes a `<ResponsiveContainer>` component that listens to size modifications of parent boundaries. As a user resizes a card in `react-grid-layout`, Recharts automatically redraws coordinates to fit the new aspect ratios.
- **Completeness**: Recharts natively supports all four visualization types we required:
  - `<BarChart>` for Categorical comparisons.
  - `<AreaChart>` with custom curves for Temporal time-series.
  - `<Treemap>` with custom cell renderers for Hierarchical parts-to-whole.
  - `<ScatterChart>` with size axes (`<ZAxis>`) for Relational correlation plots.

---

## 3. Data Schema Enforcement: Zod + TypeScript

### Context
End-to-end type safety is a core requirement. We need compile-time validation in IDEs, and strict run-time validation on the API boundary to block invalid or drifting data from crashing the frontend dashboard layout.

### Decision
We chose **Zod** for schema enforcement.

### Rationale
- **Single Source of Truth**: Zod allows us to write runtime validators and automatically infer static TypeScript types (e.g. `z.infer<typeof CategoricalDataSchema>`).
- **Strict API Validation**: The Express endpoints process database collections and mock generators, validating outputs against Zod schemas before returning payloads. If a generated structure does not conform to the expected format (e.g., temporal timestamps lack ISO-8601 formatting), Zod fails immediately and outputs a descriptive error.
- **UI Protection**: When the API fails schema parsing, the backend returns a 400 error. The frontend catches this in an isolated widget boundary and displays a retry message, protecting the shell dashboard structure.

---

## 4. Layout Persistence: MongoDB + Mongoose

### Context
Users require dashboard configurations (widget ordering, titles, and layout parameters) to persist across browser reloads.

### Decision
We chose **MongoDB** coupled with **Mongoose**.

### Rationale
- **Dynamic Documents**: Dashboard layouts are fundamentally tree structures of widget nodes. The settings for a scatter plot (e.g. X/Y limits) differ completely from line-chart options (e.g. seasonal waves). MongoDB's document model allows saving schema-less JSON payloads natively without complex table joins.
- **Robust Persistence Failover**: In the event of a database disconnection or network offline status, the frontend store automatically falls back to `LocalStorage` caching.
