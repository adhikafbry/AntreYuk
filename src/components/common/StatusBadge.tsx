import React from 'react';
import { QueueStatus } from '../../types/queue';
import { Clock, BellRing, Sparkles, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: QueueStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  switch (status) {
    case 'waiting':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          {showIcon && <Clock size={iconSize} className="animate-spin-slow" />}
          Menunggu
        </span>
      );

    case 'called':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-sm animate-pulse ${sizeClasses}`}>
          {showIcon && <BellRing size={iconSize} className="animate-bounce" />}
          Dipanggil
        </span>
      );

    case 'serving':
      return (
        <span className={`inline-flex items-center rounded-full bg-[#E8F5EE] text-[#14543D] border border-[#16865B]/30 font-semibold shadow-sm ${sizeClasses}`}>
          {showIcon && <Sparkles size={iconSize} className="text-[#16865B]" />}
          Sedang Dilayani
        </span>
      );

    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 ${sizeClasses}`}>
          {showIcon && <CheckCircle2 size={iconSize} />}
          Selesai
        </span>
      );

    case 'skipped':
      return (
        <span className={`inline-flex items-center rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          {showIcon && <RotateCcw size={iconSize} />}
          Dilewati
        </span>
      );

    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          {showIcon && <XCircle size={iconSize} />}
          Dibatalkan
        </span>
      );

    default:
      return null;
  }
};

