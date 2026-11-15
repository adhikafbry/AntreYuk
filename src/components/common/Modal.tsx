import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50 text-amber-600',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-[#16865B]" />,
          iconBg: 'bg-[#E8F5EE] text-[#16865B]',
          confirmBtn: 'bg-[#16865B] hover:bg-[#14543D] text-white focus:ring-[#16865B]',
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-elevated overflow-hidden transform transition-all p-6 relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${currentStyles.iconBg}`}>
            {currentStyles.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1F2937]">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center gap-2 disabled:opacity-50 ${currentStyles.confirmBtn}`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

