import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function StepsEditor({ value = [], onChange }) {
  const update = (i, v) => onChange(value.map((x, idx) => (idx === i ? v : x)));
  const add = () => onChange([...value, '']);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((step, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="mt-2 flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {i + 1}
          </span>
          <Textarea
            value={step}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Step ${i + 1} instructions`}
            className="flex-1"
            rows={2}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-1" />
        Add step
      </Button>
    </div>
  );
}