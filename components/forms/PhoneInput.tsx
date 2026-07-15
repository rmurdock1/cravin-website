'use client';

import { useState } from 'react';

/** Formats US phone digits as the user types: 9144327776 -> (914) 432-7776 */
export function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

interface PhoneInputProps {
  id: string;
  name?: string;
  required?: boolean;
}

/** Controlled tel input that live-formats to US format. Submits the formatted
 *  value (e.g. "(914) 432-7776"), which is human-readable for the manager. */
export function PhoneInput({ id, name = 'phone', required = false }: PhoneInputProps) {
  const [value, setValue] = useState('');
  return (
    <input
      type="tel"
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={(e) => setValue(formatUSPhone(e.target.value))}
      placeholder="(914) 555-0123"
      inputMode="tel"
      autoComplete="tel"
      maxLength={14}
    />
  );
}
