import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TASKBAR_HEIGHT,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  getWindowTitle
} from "../utils/windowDefaults";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface Snapshot {
  timestamp: number;
  windows: BrowserWindow[];
  activeWindowId: string | null;
}

export interface BrowserWindow extends WindowPosition, WindowSize {
  id: string;
  componentName: string;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  previousBounds?: WindowPosition & WindowSize;
}

export interface UsageStats {
  openCounts: Record<string, number>;
  pairUsage: Record<string, number>;
  lastOpened: Record<string, number>;
}

interface WindowStore {
  windows: BrowserWindow[];
  activeWindowId: string | null;
  zIndexCounter: number;
  isInitialized: boolean;
  usageStats: UsageStats;
  snapshots: Snapshot[];
  setInitialized: () => void;
  openWindow: (componentName: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  takeSnapshot: () => void;
  restoreSnapshot: (index: number) => void;
}

const DEFAULT_WIDTH = 520;
const DEFAULT_HEIGHT = 340;

const clamp = (value: number, min: number, max: number): number => {
  const upperBound = Math.max(min, max);
  return Math.min(Math.max(value, min), upperBound);
};

const getViewportBounds = (): WindowSize => {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 - TASKBAR_HEIGHT };
  }

  return {
    width: window.innerWidth,
    height: Math.max(220, window.innerHeight - TASKBAR_HEIGHT)
  };
};

const getTopVisibleWindowId = (windows: BrowserWindow[]): string | null => {
  const visible = windows
    .filter((win) => !win.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex);

  return visible[0]?.id ?? null;
};

const nextId = (componentName: string): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${componentName}-${crypto.randomUUID()}`;
  }

  return `${componentName}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

export const useWindowStore = create<WindowStore>()(
  persist(
    (set) => ({
      windows: [],
      activeWindowId: null,
      zIndexCounter: 1,
      isInitialized: false,
      setInitialized: () => set({ isInitialized: true }),

      usageStats: {
        openCounts: {},
        pairUsage: {},
        lastOpened: {}
      },

      snapshots: [],

      takeSnapshot: () =>
        set((state) => {
          const snapshot: Snapshot = {
            timestamp: Date.now(),
            windows: [...state.windows],
            activeWindowId: state.activeWindowId
          };

          // Keep last 12 snapshots (1 hour history if every 5 mins)
          const snapshots = [...state.snapshots, snapshot].slice(-12);

          return { snapshots };
        }),

      restoreSnapshot: (index) =>
        set((state) => {
          const snapshot = state.snapshots[index];
          if (!snapshot) return state;

          return {
            windows: snapshot.windows,
            activeWindowId: snapshot.activeWindowId
          };
        }),

      openWindow: (componentName) =>
        set((state) => {
          const now = Date.now();
          const usageStats = {
            openCounts: { ...state.usageStats.openCounts },
            pairUsage: { ...state.usageStats.pairUsage },
            lastOpened: { ...state.usageStats.lastOpened }
          };

          // 1. Track Usage
          usageStats.openCounts[componentName] = (usageStats.openCounts[componentName] || 0) + 1;

          let pairFound: string | null = null;

          // Check for recent opens (within 5s) to detect pairs
          Object.entries(usageStats.lastOpened).forEach(([otherName, timestamp]) => {
            if (otherName === componentName) return;

            // 5 second threshold
            if (now - timestamp < 5000) {
              const pairKey = [componentName, otherName].sort().join('|');
              usageStats.pairUsage[pairKey] = (usageStats.pairUsage[pairKey] || 0) + 1;

              // Trigger auto-layout if this pair is frequent (3+ times)
              if (usageStats.pairUsage[pairKey] >= 3) {
                pairFound = otherName;
              }
            }
          });

          usageStats.lastOpened[componentName] = now;

          // 2. Determine Window Props
          const viewport = getViewportBounds();
          const zIndex = state.zIndexCounter + 1;
          let newWindow: BrowserWindow;

          // Check if we should auto-layout
          const otherWindowIndex = pairFound
            ? state.windows.findIndex(w => w.componentName === pairFound && !w.isMinimized)
            : -1;

          if (pairFound && otherWindowIndex !== -1) {
            // AUTO LAYOUT MODE
            const width70 = Math.floor(viewport.width * 0.7);
            const width30 = viewport.width - width70;
            const height = viewport.height;

            // Create new window as Right 30%
            newWindow = {
              id: nextId(componentName),
              componentName,
              title: getWindowTitle(componentName),
              x: width70,
              y: 0,
              width: width30,
              height,
              zIndex,
              isMinimized: false,
              isMaximized: false
            };
          } else {
            // NORMAL MODE
            const offset = (state.windows.length * 24) % 220;
            const width = Math.min(DEFAULT_WIDTH, viewport.width);
            const height = Math.min(DEFAULT_HEIGHT, viewport.height);
            const x = clamp(70 + offset, 0, viewport.width - width);
            const y = clamp(50 + offset, 0, viewport.height - height);

            newWindow = {
              id: nextId(componentName),
              componentName,
              title: getWindowTitle(componentName),
              x,
              y,
              width,
              height,
              zIndex,
              isMinimized: false,
              isMaximized: false
            };
          }

          let windows = [...state.windows, newWindow];

          // If auto-layout, update the OTHER window to be Left 70%
          if (pairFound && otherWindowIndex !== -1) {
            const width70 = Math.floor(viewport.width * 0.7);
            const height = viewport.height;

            // We need to update the specific window in the array
            // Note: 'otherWindowIndex' is based on 'state.windows', so it matches 
            // the index in the spread 'windows' array (since we appended newWindow at end)
            windows = windows.map((w, index) => {
              if (index === otherWindowIndex) {
                return {
                  ...w,
                  x: 0,
                  y: 0,
                  width: width70,
                  height,
                  isMaximized: false,
                  zIndex: zIndex - 1 // Ensure it's just below the new one or handle z-index differently? 
                  // Actually, let's keep zIndex as is, or maybe bring it up?
                  // The new window has 'zIndex'. The old one has whatever it had.
                  // If we want both to be top, strictly speaking only one is active.
                  // But let's leave zIndex alone for the old one, logic handles focus on click.
                };
              }
              return w;
            });
          }

          return {
            windows,
            activeWindowId: newWindow.id,
            zIndexCounter: zIndex,
            usageStats
          };
        }),

      closeWindow: (id) =>
        set((state) => {
          const windows = state.windows.filter((win) => win.id !== id);
          const activeWindowId = state.activeWindowId === id
            ? getTopVisibleWindowId(windows)
            : state.activeWindowId;

          return {
            windows,
            activeWindowId
          };
        }),

      focusWindow: (id) =>
        set((state) => {
          const target = state.windows.find((win) => win.id === id);
          if (!target) {
            return state;
          }

          if (state.activeWindowId === id && target.zIndex === state.zIndexCounter) {
            return state;
          }

          const zIndex = state.zIndexCounter + 1;

          return {
            windows: state.windows.map((win) =>
              win.id === id
                ? {
                  ...win,
                  zIndex,
                  isMinimized: false
                }
                : win
            ),
            activeWindowId: id,
            zIndexCounter: zIndex
          };
        }),

      minimizeWindow: (id) =>
        set((state) => {
          const windows = state.windows.map((win) =>
            win.id === id
              ? {
                ...win,
                isMinimized: true
              }
              : win
          );

          const activeWindowId = state.activeWindowId === id
            ? getTopVisibleWindowId(windows)
            : state.activeWindowId;

          return {
            windows,
            activeWindowId
          };
        }),

      maximizeWindow: (id) =>
        set((state) => {
          const target = state.windows.find((win) => win.id === id);
          if (!target) {
            return state;
          }

          const viewport = getViewportBounds();
          const zIndex = state.zIndexCounter + 1;

          if (target.isMaximized && target.previousBounds) {
            return {
              windows: state.windows.map((win) =>
                win.id === id
                  ? {
                    ...win,
                    ...target.previousBounds,
                    zIndex,
                    isMaximized: false,
                    isMinimized: false,
                    previousBounds: undefined
                  }
                  : win
              ),
              activeWindowId: id,
              zIndexCounter: zIndex
            };
          }

          return {
            windows: state.windows.map((win) =>
              win.id === id
                ? {
                  ...win,
                  x: 0,
                  y: 0,
                  width: viewport.width,
                  height: viewport.height,
                  zIndex,
                  isMaximized: true,
                  isMinimized: false,
                  previousBounds: {
                    x: target.x,
                    y: target.y,
                    width: target.width,
                    height: target.height
                  }
                }
                : win
            ),
            activeWindowId: id,
            zIndexCounter: zIndex
          };
        }),

      updateWindowPosition: (id, position) =>
        set((state) => {
          const viewport = getViewportBounds();

          return {
            windows: state.windows.map((win) => {
              if (win.id !== id || win.isMaximized) {
                return win;
              }

              const maxX = Math.max(0, viewport.width - win.width);
              const maxY = Math.max(0, viewport.height - win.height);

              return {
                ...win,
                x: clamp(position.x, 0, maxX),
                y: clamp(position.y, 0, maxY)
              };
            })
          };
        }),

      updateWindowSize: (id, size) =>
        set((state) => {
          const viewport = getViewportBounds();

          return {
            windows: state.windows.map((win) => {
              if (win.id !== id || win.isMaximized) {
                return win;
              }

              const maxWidth = Math.max(MIN_WINDOW_WIDTH, viewport.width - win.x);
              const maxHeight = Math.max(MIN_WINDOW_HEIGHT, viewport.height - win.y);

              return {
                ...win,
                width: clamp(size.width, MIN_WINDOW_WIDTH, maxWidth),
                height: clamp(size.height, MIN_WINDOW_HEIGHT, maxHeight)
              };
            })
          };
        })
    }),
    {
      name: "window-storage"
    }
  )
);
