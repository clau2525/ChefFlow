import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function IngredientEditor({ value = [], onChange }) {
  const update = (i, field, v) =>
    onChange(value.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const add = () => onChange([...value, { name: '', quantity: '', unit: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((ing, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <Input
            className="col-span-7"
            placeholder="Ingredient"
            value={ing.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <Input
            className="col-span-2"
            placeholder="Qty"
            value={ing.quantity}
            onChange={(e) => update(i, 'quantity', e.target.value)}
          />
          <Input
            className="col-span-2"
            placeholder="Unit"
            value={ing.unit}
            onChange={(e) => update(i, 'unit', e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="col-span-1"
            onClick={() => remove(i)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-1" />
        Add ingredient
      </Button>
    </div>
  );
}