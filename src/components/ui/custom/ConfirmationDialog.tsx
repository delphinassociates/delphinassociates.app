'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-400" size={24} />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-400" size={24} />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      button: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    info: {
      icon: <AlertTriangle className="text-blue-400" size={24} />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog Body */}
      <div className="relative w-full max-w-md glass-panel border border-border rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-xl ${style.bg} border ${style.border}`}>
              {style.icon}
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-border bg-transparent hover:bg-white/5"
            >
              {cancelText}
            </Button>
            <Button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 font-bold ${style.button}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>

        {/* Bottom Warning Bar */}
        <div className="bg-red-500/5 border-t border-red-500/10 px-6 py-3 flex items-center gap-2">
          <AlertTriangle size={12} className="text-red-400/60" />
          <span className="text-[10px] font-display uppercase tracking-widest text-red-400/60">
            Critical Action: Irreversible
          </span>
        </div>
      </div>
    </div>
  );
}
