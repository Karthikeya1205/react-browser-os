import { useRef, PointerEvent } from "react";
import { useWindowStore } from "../store/windowStore";
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, RESIZE_HANDLES, ResizeDirection } from "../utils/windowDefaults";

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

interface ResizeState {
  pointerId: number;
  direction: ResizeDirection;
  startX: number;
  startY: number;
  startWindowX: number;
  startWindowY: number;
  startWidth: number;
  startHeight: number;
  lastX: number;
  lastY: number;
  lastWidth: number;
  lastHeight: number;
}

export function Window({ id, title, children }: WindowProps) {
  const windowData = useWindowStore((state) => state.windows.find((win) => win.id === id));
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const updateWindowPosition = useWindowStore((state) => state.updateWindowPosition);
  const updateWindowSize = useWindowStore((state) => state.updateWindowSize);

  const windowRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);

  if (!windowData || windowData.isMinimized) {
    return null;
  }

  const isActive = activeWindowId === id;

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (windowRef.current) {
      windowRef.current.classList.remove("is-dragging");
      windowRef.current.style.transform = "";
    }

    const { lastX, lastY } = dragState.current;
    dragState.current = null;

    if (typeof lastX === "number" && typeof lastY === "number") {
      updateWindowPosition(id, { x: lastX, y: lastY });
    }
  };

  const startDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    focusWindow(id);

    if (windowData.isMaximized) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - windowData.x,
      offsetY: event.clientY - windowData.y,
      startX: windowData.x,
      startY: windowData.y,
      lastX: windowData.x,
      lastY: windowData.y
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragWindow = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    // Raw calculated position based on mouse offset
    const rawX = event.clientX - dragState.current.offsetX;
    const rawY = event.clientY - dragState.current.offsetY;

    // Viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxX = Math.max(0, viewportWidth - windowData.width);
    const maxY = Math.max(0, viewportHeight - windowData.height);

    // Snapping Logic
    const SNAP_THRESHOLD = 20;

    let x = Math.min(Math.max(0, rawX), maxX);
    let y = Math.min(Math.max(0, rawY), maxY);

    if (x < SNAP_THRESHOLD) x = 0;
    if (x > maxX - SNAP_THRESHOLD) x = maxX;
    if (y < SNAP_THRESHOLD) y = 0;
    if (y > maxY - SNAP_THRESHOLD) y = maxY;

    dragState.current.lastX = x;
    dragState.current.lastY = y;

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      if (windowRef.current) {
        windowRef.current.classList.add("is-dragging");
        // Calculate delta for transform
        const deltaX = x - (dragState.current?.startX ?? 0);
        const deltaY = y - (dragState.current?.startY ?? 0);
        windowRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        // NOTE: We do NOT update left/top here anymore to avoid layout thrashing.
      }
    });
  };

  const stopResizing = (event: PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current || resizeState.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const { lastX, lastY, lastWidth, lastHeight } = resizeState.current;
    resizeState.current = null;

    if (
      typeof lastX === "number" &&
      typeof lastY === "number" &&
      typeof lastWidth === "number" &&
      typeof lastHeight === "number"
    ) {
      updateWindowPosition(id, { x: lastX, y: lastY });
      updateWindowSize(id, { width: lastWidth, height: lastHeight });
    }
  };

  const startResizing =
    (direction: ResizeDirection) => (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || windowData.isMaximized) {
        return;
      }

      event.stopPropagation();
      focusWindow(id);

      resizeState.current = {
        pointerId: event.pointerId,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startWindowX: windowData.x,
        startWindowY: windowData.y,
        startWidth: windowData.width,
        startHeight: windowData.height,
        lastX: windowData.x,
        lastY: windowData.y,
        lastWidth: windowData.width,
        lastHeight: windowData.height
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    };

  const resizeWindow = (event: PointerEvent<HTMLDivElement>) => {
    const state = resizeState.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    let nextX = state.startWindowX;
    let nextY = state.startWindowY;
    let nextWidth = state.startWidth;
    let nextHeight = state.startHeight;

    if (state.direction.includes("e")) {
      nextWidth = state.startWidth + dx;
    }

    if (state.direction.includes("s")) {
      nextHeight = state.startHeight + dy;
    }

    if (state.direction.includes("w")) {
      nextWidth = state.startWidth - dx;
      nextX = state.startWindowX + dx;
      // Clamp width
      if (nextWidth < MIN_WINDOW_WIDTH) {
        const diff = MIN_WINDOW_WIDTH - nextWidth;
        nextWidth = MIN_WINDOW_WIDTH;
        nextX -= diff; // Adjust X back if we hit min width
      }
    }

    if (state.direction.includes("n")) {
      nextHeight = state.startHeight - dy;
      nextY = state.startWindowY + dy;
      // Clamp height
      if (nextHeight < MIN_WINDOW_HEIGHT) {
        const diff = MIN_WINDOW_HEIGHT - nextHeight;
        nextHeight = MIN_WINDOW_HEIGHT;
        nextY -= diff;
      }
    }

    // Final min dimension checks (for e and s directions)
    if (nextWidth < MIN_WINDOW_WIDTH) nextWidth = MIN_WINDOW_WIDTH;
    if (nextHeight < MIN_WINDOW_HEIGHT) nextHeight = MIN_WINDOW_HEIGHT;

    state.lastX = nextX;
    state.lastY = nextY;
    state.lastWidth = nextWidth;
    state.lastHeight = nextHeight;

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      if (windowRef.current) {
        windowRef.current.style.width = `${nextWidth}px`;
        windowRef.current.style.height = `${nextHeight}px`;
        windowRef.current.style.left = `${nextX}px`;
        windowRef.current.style.top = `${nextY}px`;
      }
    });
  };

  return (
    <div
      ref={windowRef}
      className={`window ${isActive ? "active" : ""} ${windowData.isMaximized ? "maximized" : ""}`}
      style={{
        left: `${windowData.x}px`,
        top: `${windowData.y}px`,
        width: `${windowData.width}px`,
        height: `${windowData.height}px`,
        zIndex: windowData.zIndex
      }}
      onPointerDown={() => focusWindow(id)}
    >
      <div
        className="window-titlebar"
        onDoubleClick={() => maximizeWindow(id)}
        onPointerDown={startDragging}
        onPointerMove={dragWindow}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button
            type="button"
            className="window-control"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => minimizeWindow(id)}
            aria-label="Minimize window"
            title="Minimize"
          >
            -
          </button>
          <button
            type="button"
            className="window-control"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => maximizeWindow(id)}
            aria-label="Maximize window"
            title="Maximize"
          >
            [ ]
          </button>
          <button
            type="button"
            className="window-control close"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => closeWindow(id)}
            aria-label="Close window"
            title="Close"
          >
            x
          </button>
        </div>
      </div>

      <div className="window-content">{children}</div>

      {!windowData.isMaximized &&
        RESIZE_HANDLES.map((direction) => (
          <div
            key={direction}
            className={`window-resize-handle ${direction}`}
            onPointerDown={startResizing(direction)}
            onPointerMove={resizeWindow}
            onPointerUp={stopResizing}
            onPointerCancel={stopResizing}
          />
        ))}
    </div>
  );
}
