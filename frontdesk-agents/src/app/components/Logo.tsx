import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring - representing connectivity */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="currentColor" />
        
        {/* Stylized "F" shape - representing FrontDesk */}
        <path
          d="M12 28V12H26M12 20H24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* AI node network - subtle dots representing AI */}
        <circle cx="26" cy="14" r="2" fill="white" opacity="0.8" />
        <circle cx="28" cy="22" r="1.5" fill="white" opacity="0.6" />
        <circle cx="16" cy="26" r="1.5" fill="white" opacity="0.6" />
        
        {/* Connection lines */}
        <path
          d="M26 16L28 22M26 16L24 18M28 22L24 20"
          stroke="white"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default Logo;
