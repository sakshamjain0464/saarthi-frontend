// src/components/ui/alert.js
import React from 'react';

export const Alert = ({ children, className = '' }) => (
  <div className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-4px] ${className}`}>
    {children}
  </div>
);

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);