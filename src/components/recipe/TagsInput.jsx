import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TagsInput({ value = [], onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1 pr-1">
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Add a folder/tag, press Enter"
      />
    </div>
  );
}