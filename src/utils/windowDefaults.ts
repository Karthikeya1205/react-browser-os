export const APP_REGISTRY = [
  { componentName: "browser", title: "Web Browser" },
  { componentName: "files", title: "File Explorer" },
  { componentName: "notes", title: "Notes" },
  { componentName: "calculator", title: "Calculator" },
  { componentName: "settings", title: "Settings" },
  { componentName: "terminal", title: "Terminal" }
];

export const TASKBAR_HEIGHT = 44;
export const MIN_WINDOW_WIDTH = 260;
export const MIN_WINDOW_HEIGHT = 160;

export const RESIZE_HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
export type ResizeDirection = typeof RESIZE_HANDLES[number];

export const getWindowTitle = (componentName: string): string => {
  const app = APP_REGISTRY.find((item) => item.componentName === componentName);
  if (app) {
    return app.title;
  }

  return componentName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
