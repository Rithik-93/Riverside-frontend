import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5'
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-[#972fff]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#972fff] border-r-[#c58aff] animate-spin"></div>
        </div>
        {text && (
          <p className="text-sm text-foreground/60 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`${dotSizeClasses[size]} rounded-full bg-[#972fff] animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`${dotSizeClasses[size]} rounded-full bg-[#c58aff] animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`${dotSizeClasses[size]} rounded-full bg-[#ebd7ff] animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && (
          <p className="text-sm text-foreground/60 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#972fff] to-[#c58aff] animate-pulse`}></div>
        {text && (
          <p className="text-sm text-foreground/60 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  return null;
};



