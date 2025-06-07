import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

interface AlertState extends AlertProps {
  id: string;
  visible: boolean;
}

// Create a global alerts array and functions to manage it
let alerts: AlertState[] = [];
let alertListeners: (() => void)[] = [];

const notifyListeners = () => {
  alertListeners.forEach(listener => listener());
};

// Global functions to show alerts
export const showAlert = (props: AlertProps): string => {
  const id = Math.random().toString(36).substring(2, 9);
  const newAlert = { ...props, id, visible: true };
  alerts = [...alerts, newAlert];
  notifyListeners();
  
  if (props.duration !== 0) {
    setTimeout(() => {
      dismissAlert(id);
    }, props.duration || 5000);
  }
  
  return id;
};

export const dismissAlert = (id: string) => {
  alerts = alerts.map(alert => 
    alert.id === id ? { ...alert, visible: false } : alert
  );
  notifyListeners();
  
  // Remove from array after animation completes
  setTimeout(() => {
    alerts = alerts.filter(alert => alert.id !== id);
    notifyListeners();
  }, 300);
};

// Alert component for individual alerts
const Alert: React.FC<AlertState> = ({ message, type = 'info', id, visible, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    dismissAlert(id);
  };
  
  return (
    <div 
      className={`flex items-start p-4 rounded-md border shadow-sm mb-2 transition-all duration-300 transform ${getBgColor()} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className={`flex-shrink-0 ${getIconColor()}`}>
        {getIcon()}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm">{message}</p>
      </div>
      <button 
        onClick={handleClose}
        className="ml-auto flex-shrink-0 -mt-1 -mr-1 p-1 rounded-full hover:bg-black/5"
      >
        <X className="h-4 w-4 opacity-60" />
      </button>
    </div>
  );
};

// AlertContainer component to render all alerts
export const AlertContainer: React.FC = () => {
  const [localAlerts, setLocalAlerts] = useState<AlertState[]>(alerts);
  
  const updateAlerts = useCallback(() => {
    setLocalAlerts([...alerts]);
  }, []);
  
  useEffect(() => {
    alertListeners.push(updateAlerts);
    return () => {
      alertListeners = alertListeners.filter(listener => listener !== updateAlerts);
    };
  }, [updateAlerts]);
  
  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      {localAlerts.map(alert => (
        <Alert key={alert.id} {...alert} />
      ))}
    </div>
  );
};

export default Alert; 