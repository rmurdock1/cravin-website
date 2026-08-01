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
  defaultValue?: string;
  /** Optional controlled mode — when both are set, the parent owns the value
   *  (so it can be pre-filled from a document scan). */
  value?: string;
  onChange?: (formatted: string) => void;
}

/** Live-formats a US phone as the user types, e.g. "(914) 432-7776". Submits the
 *  formatted value (human-readable for the manager). Uncontrolled by default;
 *  controlled when `value` + `onChange` are supplied. */
export function PhoneInput({
  id,
  name = 'phone',
  required = false,
  defaultValue = '',
  value,
  onChange,
}: PhoneInputProps) {
  const controlled = value !== undefined && onChange !== undefined;
  const [internal, setInternal] = useState(() => formatUSPhone(defaultValue));
  const shown = controlled ? formatUSPhone(value!) : internal;

  return (
    <input
      type="tel"
      id={id}
      name={name}
      required={required}
      value={shown}
      onChange={(e) => {
        const f = formatUSPhone(e.target.value);
        if (controlled) onChange!(f);
        else setInternal(f);
      }}
      placeholder="(914) 555-0123"
      inputMode="tel"
      autoComplete="tel"
      maxLength={14}
    />
  );
}
