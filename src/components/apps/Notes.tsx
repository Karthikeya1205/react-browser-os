import { useState } from "react";

export function NotesApp() {
    const [activeNote, setActiveNote] = useState(0);
    const [notes, setNotes] = useState([
        { id: 1, title: "Welcome", content: "Welcome to BrowserOS Notes!" },
        { id: 2, title: "Ideas", content: "1. Build Time Machine\n2. Add Theme Engine\n3. Implement AI" }
    ]);
    const [search, setSearch] = useState("");

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            title: "New Note",
            content: ""
        };
        setNotes([newNote, ...notes]);
        setActiveNote(0);
    };

    const updateNote = (field: string, value: string) => {
        const updatedNotes = [...notes];
        updatedNotes[activeNote] = { ...updatedNotes[activeNote], [field]: value };
        setNotes(updatedNotes);
    };

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="notes-app">
            <div className="notes-sidebar">
                <div className="notes-header">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button className="add-btn" onClick={addNote}>+</button>
                </div>
                <div className="notes-list">
                    {filteredNotes.map((note, index) => (
                        <div
                            key={note.id}
                            className={`note-item ${index === activeNote ? "active" : ""}`}
                            onClick={() => setActiveNote(index)}
                        >
                            <h4>{note.title || "Untitled"}</h4>
                            <p>{note.content.substring(0, 30)}...</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="notes-editor">
                {notes[activeNote] ? (
                    <>
                        <input
                            className="note-title-input"
                            value={notes[activeNote].title}
                            onChange={(e) => updateNote("title", e.target.value)}
                            placeholder="Title"
                        />
                        <textarea
                            className="note-content-input"
                            value={notes[activeNote].content}
                            onChange={(e) => updateNote("content", e.target.value)}
                            placeholder="Start typing..."
                        />
                        <div className="note-meta">
                            Last edited: Just now
                        </div>
                    </>
                ) : (
                    <div className="no-note-selected">Select a note to view</div>
                )}
            </div>

            <style>{`
        .notes-app {
          display: flex;
          height: 100%;
          background: white;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .notes-sidebar {
          width: 250px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        .notes-header {
          padding: 12px;
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .search-input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;
        }
        .add-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
        }
        .add-btn:hover {
          background: #2563eb;
        }
        .notes-list {
          flex: 1;
          overflow-y: auto;
        }
        .note-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.1s;
        }
        .note-item:hover {
          background: #e2e8f0;
        }
        .note-item.active {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
        }
        .note-item h4 {
          margin: 0 0 4px;
          font-size: 14px;
          color: #1e293b;
        }
        .note-item p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notes-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
        }
        .note-title-input {
          font-size: 24px;
          font-weight: 600;
          border: none;
          outline: none;
          margin-bottom: 16px;
          color: #0f172a;
          width: 100%;
        }
        .note-content-input {
          flex: 1;
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          line-height: 1.6;
          color: #334155;
          font-family: inherit;
        }
        .note-meta {
          margin-top: 12px;
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
        }
        .no-note-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
}
