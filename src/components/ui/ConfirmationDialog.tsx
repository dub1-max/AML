import React from 'react';
import Dialog from './Dialog';
import { AlertCircle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: 'warning' | 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  description = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  variant = 'warning'
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-amber-600';
    }
  };

  const getConfirmButtonColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-purple-600 hover:bg-purple-700';
    }
  };

  const defaultIcon = <AlertCircle className="w-6 h-6" />;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} maxWidth="sm">
      <div className="flex items-start">
        {(icon || defaultIcon) && (
          <div className={`mr-3 flex-shrink-0 ${getIconColor()}`}>
            {icon || defaultIcon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-md transition-colors ${getConfirmButtonColor()}`}
        >
          {confirmText}
        </button>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog; 