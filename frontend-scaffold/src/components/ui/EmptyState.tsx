import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <h3 className="font-bold uppercase tracking-wide text-lg">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 max-w-sm">{description}</p>
      )}
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
