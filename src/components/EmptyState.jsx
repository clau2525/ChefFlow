import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-medium text-lg">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}