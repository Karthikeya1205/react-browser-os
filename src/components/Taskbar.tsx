import { useWindowStore } from "../store/windowStore";
import { AppIcon } from "./AppIcon";
import { TimeMachine } from "./TimeMachine";

export function Taskbar() {
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  const orderedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <footer className="taskbar" aria-label="Taskbar">
      {orderedWindows.map((win) => {
        const isActive = activeWindowId === win.id;
        return (
          <button
            key={win.id}
            type="button"
            className={`taskbar-item ${isActive ? "active" : ""} ${win.isMinimized ? "minimized" : ""}`}
            onClick={() => focusWindow(win.id)}
            title={win.title}
            aria-label={win.title}
          >
            <AppIcon appName={win.componentName} size={20} />
          </button>
        );
      })}

      <div style={{ flex: 1 }} />
      <TimeMachine />
    </footer>
  );
}
