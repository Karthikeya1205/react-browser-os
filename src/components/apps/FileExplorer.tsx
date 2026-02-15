import { useState } from "react";

interface File {
    id: string;
    name: string;
    type: "file" | "folder";
    size?: string;
    modified: string;
}

const INITIAL_FILES: File[] = [
    { id: "1", name: "Documents", type: "folder", modified: "Today" },
    { id: "2", name: "Images", type: "folder", modified: "Yesterday" },
    { id: "3", name: "Resume.pdf", type: "file", size: "2.4 MB", modified: "Last Week" },
    { id: "4", name: "Notes.txt", type: "file", size: "12 KB", modified: "Just Now" },
    { id: "5", name: "Screenshot.png", type: "file", size: "1.8 MB", modified: "Today" }
];

export function FileExplorer() {
    const [currentPath, setCurrentPath] = useState(["Root"]);
    const [files, setFiles] = useState(INITIAL_FILES);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const handleOpen = (file: File) => {
        if (file.type === "folder") {
            setCurrentPath([...currentPath, file.name]);
            // Mock loading new folder content
            setFiles([
                { id: "f1", name: "Project Specs.docx", type: "file", size: "24 KB", modified: "Today" },
                { id: "f2", name: "budget.xlsx", type: "file", size: "15 KB", modified: "Yesterday" }
            ]);
        }
    };

    const handleBack = () => {
        if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            setFiles(INITIAL_FILES);
        }
    };

    return (
        <div className="file-explorer">
            <div className="file-toolbar">
                <button onClick={handleBack} disabled={currentPath.length === 1} className="nav-btn">
                    ← Back
                </button>
                <div className="breadcrumb">
                    {currentPath.join(" / ")}
                </div>
            </div>

            <div className="file-grid">
                {files.map(file => (
                    <div
                        key={file.id}
                        className={`file-item ${selectedFile === file.id ? "selected" : ""}`}
                        onClick={() => setSelectedFile(file.id)}
                        onDoubleClick={() => handleOpen(file)}
                    >
                        <div className={`file-icon ${file.type}`} />
                        <span className="file-name">{file.name}</span>
                        <span className="file-meta">{file.size || "-"}</span>
                    </div>
                ))}
            </div>

            <div className="file-statusbar">
                {files.length} items | {selectedFile ? "1 item selected" : ""}
            </div>

            <style>{`
        .file-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8fafc;
          font-family: system-ui, sans-serif;
        }
        .file-toolbar {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
        }
          button.nav-btn.nav-btn {
            background-color: transparent;
            color: black;
            border: 1px solid #e2e8f0;
        }
        .nav-btn:hover {
            background-color: #f1f5f9;
        }
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .breadcrumb {
          font-size: 14px;
          color: #475569;
        }
        .file-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 16px;
          padding: 16px;
          overflow-y: auto;
        }
        .file-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .file-item:hover {
          background: #e2e8f0;
        }
        .file-item.selected {
          background: #bfdbfe;
          border: 1px solid #60a5fa;
        }
        .file-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .file-icon.folder {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23f59e0b' viewBox='0 0 24 24'%3E%3Cpath d='M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'/%3E%3C/svg%3E");
        }
        .file-icon.file {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E");
        }
        .file-name {
          font-size: 13px;
          text-align: center;
          word-break: break-word;
          color: #1e293b;
        }
        .file-meta {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }
        .file-statusbar {
          padding: 4px 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
          background: #f1f5f9;
        }
      `}</style>
        </div>
    );
}
