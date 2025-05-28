import React from 'react';

interface TabsProps {
    defaultValue: string;
    className?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

interface TabsListProps {
    className?: string;
    children: React.ReactNode;
}

interface TabsTriggerProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = '', onValueChange, children }) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(activeTab);
        }
    }, [activeTab, onValueChange]);

    return (
        <div className={className} data-active-tab={activeTab}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        activeTab,
                        setActiveTab
                    });
                }
                return child;
            })}
        </div>
    );
};

export const TabsList: React.FC<TabsListProps & { activeTab?: string; setActiveTab?: (value: string) => void }> = ({ 
    className = '', 
    children 
}) => {
    return (
        <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
            {children}
        </div>
    );
};

export const TabsTrigger: React.FC<TabsTriggerProps & { activeTab?: string; setActiveTab?: (value: string) => void }> = ({ 
    value, 
    className = '', 
    children, 
    activeTab,
    setActiveTab
}) => {
    return (
        <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === value 
                    ? 'bg-white text-purple-700 shadow' 
                    : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
            } ${className}`}
            onClick={() => setActiveTab?.(value)}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<TabsContentProps & { activeTab?: string }> = ({ 
    value, 
    children,
    activeTab 
}) => {
    if (activeTab !== value) return null;
    
    return (
        <div className="mt-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none">
            {children}
        </div>
    );
}; 