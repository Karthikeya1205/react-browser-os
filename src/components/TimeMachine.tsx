import { useState } from "react";
import { useWindowStore } from "../store/windowStore";
import { History } from "lucide-react";

export function TimeMachine() {
    const snapshots = useWindowStore((state) => state.snapshots);
    const restoreSnapshot = useWindowStore((state) => state.restoreSnapshot);
    const [isOpen, setIsOpen] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);

    if (snapshots.length === 0) return null;

    const handleRestore = (index: number) => {
        restoreSnapshot(index);
        setSliderValue(index);
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="time-machine-container">
            <button
                className={`time-machine-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Time Machine"
            >
                <History size={20} />
            </button>

            {isOpen && (
                <div className="time-machine-ui">
                    <div className="time-machine-header">
                        <h4>Layout History</h4>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="time-machine-content">
                        <input
                            type="range"
                            min="0"
                            max={snapshots.length - 1}
                            step="1"
                            value={sliderValue}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handleRestore(val);
                            }}
                            className="time-slider"
                        />

                        <div className="snapshot-info">
                            {snapshots[sliderValue] && (
                                <span>Restored to: {formatTime(snapshots[sliderValue].timestamp)}</span>
                            )}
                            <span className="total-snapshots">{snapshots.length} Snapshots</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
