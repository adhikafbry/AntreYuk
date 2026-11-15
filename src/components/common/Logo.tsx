import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  linkToHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  linkToHome = true,
}) => {
  const iconSizeClass = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const titleSizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Ticket Icon */}
      <div className={`relative ${iconSizeClass} bg-[#16865B] rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5/6 h-5/6 text-white"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" fill="#14543D" />
          <path d="M9 9h6" stroke="#FFFFFF" />
          <path d="M9 13h6" stroke="#FFFFFF" />
          <circle cx="12" cy="12" r="1.5" fill="#E8F5EE" stroke="none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[#1F2937] leading-tight ${titleSizeClass}`}>
          Antre<span className="text-[#16865B]">Yuk</span>
        </span>
        {showTagline && (
          <span className="text-xs text-[#6B7280] font-medium hidden sm:block">
            Antre tanpa harus menunggu di tempat!
          </span>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex group focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

