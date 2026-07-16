'use client';

import { useState } from 'react';

/** A friendly repeatable list: each item is its own bulleted input row with a
 *  remove button, plus an "Add item" button. Submits as multiple form fields
 *  under `name` (server reads formData.getAll(name)). */
export function BulletListInput({
  name,
  label,
  hint,
  placeholder = 'Add an item…',
  initial,
}: {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  initial?: string[];
}) {
  const [items, setItems] = useState<string[]>(initial && initial.length ? initial : ['']);

  const update = (i: number, val: string) =>
    setItems(items.map((it, idx) => (idx === i ? val : it)));
  const add = () => setItems([...items, '']);
  const remove = (i: number) =>
    setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : ['']);

  return (
    <div className="bullet-field">
      <span className="bullet-label">
        {label} {hint && <span className="admin-form-hint">{hint}</span>}
      </span>
      <div className="bullet-list">
        {items.map((it, i) => (
          <div className="bullet-row" key={i}>
            <span className="bullet-dot" aria-hidden="true">•</span>
            <input
              name={name}
              value={it}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              className="bullet-remove"
              onClick={() => remove(i)}
              aria-label="Remove item"
              tabIndex={-1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="bullet-add" onClick={add}>
        + Add item
      </button>
    </div>
  );
}
