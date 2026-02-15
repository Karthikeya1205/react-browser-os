# Browser OS

A polished, high-performance web-based operating system interface built with **React**, **TypeScript**, and **Zustand**. This project pushes the boundaries of browser-based UIs with 60fps glassmorphism effects, persistent state, and time-travel capabilities.


https://github.com/user-attachments/assets/3b422d76-e2a8-4c8a-9a24-ee42cff119be




## 🚀 Key Features

### 🖥️ Advanced Window Management
- **High-Performance Dragging**: Custom drag engine using `requestAnimationFrame` and direct DOM manipulation to ensure zero-latency movement even with heavy blur effects.
- **Smart Snapping**: Windows automatically snap to screen edges when dragged near boundaries.
- **Focus Hierarchy**: sophisticated depth system with dynamic shadows, blurring, and dimming for inactive windows.
- **Z-Index Handling**: Intelligent layering ensures the active window is always responsive.

### ⏳ Time Machine (Snapshot Timeline)
- **Automatic History**: The OS captures the exact state (window positions, sizes, active apps) every 5 minutes.
- **Interactive Restore**: A "Time Machine" UI allows you to scrub through history and instantly restore previous desktop layouts.
- **State Persistence**: Layouts survive page reloads thanks to local storage synchronization.

### 🎨 Premium UI Experience
- **Glassmorphism**: Real-time background blurring (`backdrop-filter`) with noise textures and gradients for a premium "frosted glass" aesthetic.
- **Smooth Animations**: 150ms cubic-bezier transitions for opening, closing, and interactions.
- **SVG Iconography**: Fully vector-based icons using `lucide-react` for crisp rendering at any scale.

### 📱 Integrated Applications
- **Web Browser**: A simulated browser environment.
- **Notes**: Functional note-taking with local state.
- **Calculator**: A fully working standard calculator.
- **File Explorer**: Browse a virtual file system structure.
- **Terminal**: Simulated command-line interface.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with custom persistence middleware)
- **Styling**: Native CSS Variables, Advanced CSS Modules-like scoping, Hardware-Accelerated Animations.
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Karthikeya1205/react-browser-os.git
   cd react-browser-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the OS at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🎮 Desktop Controls

- **Open App**: Click any icon on the desktop launcher or taskbar.
- **Move Window**: Drag the window title bar.
- **Snap**: Drag a window firmly to the left/right/top edge.
- **Resize**: Drag any edge or corner of a window.
- **Time Machine**: Click the Clock/History icon in the bottom-right of the taskbar to open the timeline.


<img width="1907" height="913" alt="browser-os-demo png" src="https://github.com/user-attachments/assets/c0443a3f-7da2-4580-a75d-8b56c0bc964e" />



## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
"# react-browser-os" 
