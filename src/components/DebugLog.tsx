import React, { useState, useEffect } from 'react';

interface LogEntry {
    message: string;
    timestamp: Date;
    type: 'info' | 'error' | 'success';
}

// Global log storage
const logEntries: LogEntry[] = [];

// Function to add to the log (can be called from anywhere)
export function addLog(message: string, type: 'info' | 'error' | 'success' = 'info') {
    const entry: LogEntry = {
        message,
        timestamp: new Date(),
        type
    };
    logEntries.unshift(entry); // Add to beginning
    
    // Keep the log size manageable
    if (logEntries.length > 50) {
        logEntries.pop();
    }
    
    // Dispatch an event to notify components
    const event = new CustomEvent('debug-log-updated');
    window.dispatchEvent(event);
}

interface DebugLogProps {
    show?: boolean;
}

const DebugLog: React.FC<DebugLogProps> = ({ show = true }) => {
    const [entries, setEntries] = useState<LogEntry[]>(logEntries);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const handleUpdate = () => {
            setEntries([...logEntries]);
        };
        
        window.addEventListener('debug-log-updated', handleUpdate);
        return () => {
            window.removeEventListener('debug-log-updated', handleUpdate);
        };
    }, []);
    
    if (!show) return null;
    
    return (
        <div className="fixed bottom-0 right-0 z-50">
            <button 
                onClick={() => setIsVisible(!isVisible)}
                className="bg-gray-800 text-white px-4 py-2 rounded-tl-md"
            >
                {isVisible ? 'Hide Debug' : 'Show Debug'}
            </button>
            
            {isVisible && (
                <div className="w-96 h-64 bg-gray-900 text-white p-4 overflow-auto">
                    <h3 className="text-lg font-semibold mb-2">Debug Log</h3>
                    <div className="space-y-2">
                        {entries.map((entry, index) => (
                            <div 
                                key={index} 
                                className={`text-xs p-1 ${
                                    entry.type === 'error' ? 'text-red-400' : 
                                    entry.type === 'success' ? 'text-green-400' : 
                                    'text-gray-300'
                                }`}
                            >
                                <span className="text-gray-500">
                                    {entry.timestamp.toLocaleTimeString()}:
                                </span>{' '}
                                {entry.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugLog; 