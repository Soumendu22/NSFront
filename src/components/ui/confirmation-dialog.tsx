'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 border-red-500/30',
          iconBg: 'bg-red-500/20 border-red-500/30'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500/30',
          iconBg: 'bg-yellow-500/20 border-yellow-500/30'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 border-blue-500/30',
          iconBg: 'bg-blue-500/20 border-blue-500/30'
        };
    }
  };

  const styles = getTypeStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md p-6 mx-4 border rounded-xl bg-gray-900/95 backdrop-blur-sm border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full border ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 transition-colors rounded hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 border bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white border ${styles.confirmButton}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
