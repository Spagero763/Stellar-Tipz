import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  if (orientation === 'vertical') {
    return <div className={`border-l-2 border-black h-full ${className}`} role="separator" aria-orientation="vertical" />;
  }

  return <div className={`border-t-2 border-black w-full ${className}`} role="separator" aria-orientation="horizontal" />;
};

export default Divider;
