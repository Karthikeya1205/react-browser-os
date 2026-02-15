import { useEffect } from "react";
import { AppIcon } from "./components/AppIcon";
import { Taskbar } from "./components/Taskbar";
import { Window } from "./components/Window";
import { Calculator } from "./components/apps/Calculator";
import { FileExplorer } from "./components/apps/FileExplorer";
import { NotesApp } from "./components/apps/Notes";
import { useWindowStore } from "./store/windowStore";
import { APP_REGISTRY } from "./utils/windowDefaults";

const renderWindowBody = (componentName: string) => {
  switch (componentName) {
    case "browser":
      return (
        <section className="app-panel">
          <h3>Web Browser</h3>
          <p>Search the web and pin your favorite apps inside BrowserOS.</p>
        </section>
      );

    case "files":
      return <FileExplorer />;

    case "notes":
      return <NotesApp />;

    case "calculator":
      return <Calculator />;

    case "settings":
      return (
        <section className="app-panel">
          <h3>Settings</h3>
          <p>Tune system behavior, visuals, and workspace defaults.</p>
        </section>
      );

    case "terminal":
      return (
        <section className="app-panel">
          <h3>Terminal</h3>
          <p>Run commands and automate BrowserOS workflows.</p>
        </section>
      );

    default:
      return (
        <section className="app-panel">
          <h3>{componentName}</h3>
          <p>Window initialized successfully.</p>
        </section>
      );
  }
};


export default function App() {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);

  const isInitialized = useWindowStore((state) => state.isInitialized);
  const setInitialized = useWindowStore((state) => state.setInitialized);

  const takeSnapshot = useWindowStore((state) => state.takeSnapshot);

  useEffect(() => {
    if (!isInitialized) {
      openWindow("browser");
      openWindow("notes");
      setInitialized();
      takeSnapshot(); // Take initial snapshot
    }
  }, [isInitialized, openWindow, setInitialized, takeSnapshot]);

  // Auto-snapshot every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      takeSnapshot();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [takeSnapshot]);

  return (
    <div className="desktop-shell">
      <header className="desktop-launcher" aria-label="Application launcher">
        {APP_REGISTRY.map((app) => (
          <button
            key={app.componentName}
            type="button"
            className="launch-button"
            onClick={() => openWindow(app.componentName)}
            title={app.title}
          >
            <AppIcon appName={app.componentName} size={32} />
            <span className="app-label">{app.title}</span>
          </button>
        ))}
      </header>

      <main className="desktop-canvas" aria-label="Desktop canvas">
        {windows.map((win) => (
          <Window key={win.id} id={win.id} title={win.title}>
            {renderWindowBody(win.componentName)}
          </Window>
        ))}
      </main>

      <Taskbar />
    </div>
  );
}
