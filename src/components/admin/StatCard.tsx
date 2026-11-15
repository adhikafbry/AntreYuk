import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'indigo' | 'gray';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color = 'emerald',
  onClick,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50/70 text-[#16865B] border-emerald-100',
      iconBg: 'bg-[#E8F5EE] text-[#16865B]',
      border: 'hover:border-emerald-200',
    },
    blue: {
      bg: 'bg-blue-50/70 text-blue-700 border-blue-100',
      iconBg: 'bg-blue-100/70 text-blue-600',
      border: 'hover:border-blue-200',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-100/70 text-amber-600',
      border: 'hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50/70 text-rose-700 border-rose-100',
      iconBg: 'bg-rose-100/70 text-rose-600',
      border: 'hover:border-rose-200',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-700 border-indigo-100',
      iconBg: 'bg-indigo-100/70 text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    gray: {
      bg: 'bg-gray-50 text-gray-700 border-gray-200',
      iconBg: 'bg-gray-200 text-gray-600',
      border: 'hover:border-gray-300',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl p-6 shadow-card border border-gray-100 flex items-start justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-elevated' : ''
      } ${colorMap.border}`}
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
          {title}
        </span>
        <div className="mt-2 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-mono">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`p-3 rounded-2xl flex-shrink-0 ${colorMap.iconBg}`}>
        {icon}
      </div>
    </div>
  );
};

