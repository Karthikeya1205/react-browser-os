# Browser OS Architecture

This document details the architectural decisions, design patterns, and technical implementation of the Browser OS project.

## 🏗️ Core Architecture

The operating system is built as a Single Page Application (SPA) using React 19. The core architecture revolves around a centralized **Window Manager** that controls the state of all open applications, their positions, z-indices, and maximize/minimize states.

### 1. State Management (`src/store/windowStore.ts`)

Instead of complex Context providers or Redux reducers, we use **Zustand** for a lightweight, performant global state.

- **`useWindowStore`**: The central hook managing the entire desktop state.
- **Data Structure**:
  ```typescript
  interface WindowData {
    id: string;           // Unique UUID
    componentName: string;// 'browser', 'notes', 'calculator', etc.
    title: string;        // Display title
    x: number;            // Absolute X coordinate
    y: number;            // Absolute Y coordinate
    width: number;        // Window width
    height: number;       // Window height
    zIndex: number;       // Layering order
    isMinimized: boolean;
    isMaximized: boolean;
  }
  ```
- **Actions**: `openWindow`, `closeWindow`, `focusWindow` (active z-index handling), `minimizeWindow`, `maximizeWindow`.
- **Snapshot Timeline**: The store maintains a `snapshots` array (history of previous states) and exposes `takeSnapshot()` and `restoreSnapshot(index)` for the Time Machine feature.
- **Persistence**: Leveraging Zustand's `persist` middleware to automatically synchronize the window state to `localStorage`, ensuring the desktop layout survives page reloads.

### 2. Rendering Optimization (`src/components/Window.tsx`)

Achieving 60fps window dragging with heavy `backdrop-filter` blur required bypassing React's reconciler during high-frequency events.

- **Direct DOM Manipulation**:
  - Instead of updating React state on every `mousemove` event (which would trigger a re-render of the entire window tree), we use `useRef` to store mutable `DragState`.
  - The `dragWindow` function calculates the new position and directly updates the DOM element's `transform` property via `windowRef.current.style.transform`.
- **`requestAnimationFrame`**: DOM updates are batched inside `requestAnimationFrame` to align with the browser's refresh rate.
- **Hardware Acceleration**: We use `transform: translate3d(x, y, 0)` during dragging instead of updating `top`/`left`. This forces the browser to composite the layer on the GPU, avoiding costly layout thrashing.
- **Commit Phase**: Only when the user releases the mouse (`onPointerUp`) do we update the Zustand global store with the final coordinates. This triggers a single React re-render to "commit" the new state.

### 3. CSS Architecture (`src/index.css`)

The UI relies heavily on modern CSS features for its glassmorphism aesthetic.

- **Glassmorphism**: 
  - `backdrop-filter: blur(12px)` creates the frosted glass effect.
  - `background: rgba(35, 35, 38, 0.65)` provides the translucent dark tint.
  - A subtle `linear-gradient` overlay adds a light reflection effect without impacting readability.
- **Transitions**: 
  - `cubic-bezier(0.4, 0, 0.2, 1)` is used for smooth, non-linear animations on window open/close and hover states.
- **Variables**: Though simple, the project uses scoped CSS classes for maintainability.

### 4. Component Hierarchy

```
App.tsx (Root)
├── DesktopLauncher (Icons on desktop)
│   └── LaunchButton (Triggers openWindow)
├── DesktopCanvas (Main area)
│   └── Window (Wrapper for all apps)
│       ├── WindowTitleBar (Drag handle, controls)
│       ├── WindowContent (Scrollable area)
│       │   └── [Dynamic Component: Calculator, Notes, etc.]
│       └── ResizeHandles (N, S, E, W, NE, NW, SE, SW)
└── Taskbar (Bottom dock)
    ├── TaskbarItem (App toggle/minimize)
    └── TimeMachine (History snapshot UI)
```

### 5. App Registry (`src/utils/windowDefaults.ts`)

New applications are added via a declarative `APP_REGISTRY`. To add a new app:
1. Create the component in `src/components/apps/`.
2. Add an entry to `APP_REGISTRY` with its title, icon, and component name.
3. Update `App.tsx`'s `renderWindowBody` switch case to render the new component.

## 🔄 Data Flow

1. **User Interaction**: User clicks a desktop icon.
2. **Store Update**: `useWindowStore.getState().openWindow('app-id')` is called.
3. **State Change**: A new `WindowData` object is pushed to the `windows` array. 
4. **Re-render**: `App.tsx` re-renders, mapping the `windows` array to `<Window />` components.
5. **Mount**: The new `<Window />` mounts with an enter animation (`scaleIn`).

## 🧩 Key Decisions

- **Why Zustand over Redux?** Less boilerplate, easier setup for simple global state, and built-in persistence.
- **Why `translate3d` over `top/left`?** Performance. `top/left` triggers layout recalculations; `transform` only triggers composition.
- **Why Local Storage?** To provide a seamless "save state" experience without a backend database.

## 🔮 Future Roadmap

- **Filesystem API**: Integrate the File System Access API for real file I/O.
- **WebAssembly**: Run heavier applications (like a code editor or game) via WASM.
- **PWA Support**: Make the OS installable as a Progressive Web App.
