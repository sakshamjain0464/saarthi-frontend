
// src/components/ui/label.js
import React from 'react';

export const Label = ({ htmlFor, children, className = '', ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);