"use client";

import React, { useState } from 'react';

interface SelectProps {
  onValueChange: (value: any) => void;
  children: React.ReactNode;
}

export function Select({ onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        child ? React.cloneElement(child as React.ReactElement<any>, { onValueChange, open, setOpen }) : null
      )}
    </div>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return (
    <button className={`border p-2 w-full rounded ${className}`}>{children}</button>
  );
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <span>{placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="absolute bg-white shadow rounded mt-2">{children}</div>;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: any;
  onValueChange: (value: any) => void;
}

export function SelectItem({ children, value, onValueChange }: SelectItemProps) {
  return (
    <div
      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
      onClick={() => onValueChange(value)}
    >
      {children}
    </div>
  );
}