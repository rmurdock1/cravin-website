'use client';

import { useRouter } from 'next/navigation';

export function TemplatePicker({
  templates,
  selected,
}: {
  templates: { id: string; name: string }[];
  selected?: string;
}) {
  const router = useRouter();
  if (templates.length === 0) return null;

  return (
    <div className="admin-template-picker">
      <label>
        Start from a template
        <select
          defaultValue={selected ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            router.push(v ? `/admin/postings/new?template=${v}` : '/admin/postings/new');
          }}
        >
          <option value="">Blank posting</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
