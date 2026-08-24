import React, { useEffect, useState } from 'react';
import {
  listShoppingItems,
  updateShoppingItem,
  deleteShoppingItem,
  deleteShoppingItems,
} from '@/api/shoppingItems';
import { Check, Trash2, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { readableError } from '@/lib/errors';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await listShoppingItems());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(item) {
    try {
      await updateShoppingItem(item.id, { checked: !item.checked });
    } catch (err) {
      setError(err.message);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)));
  }

  async function remove(item) {
    try {
      await deleteShoppingItem(item.id);
    } catch (err) {
      setError(err.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function clearChecked() {
    const checked = items.filter((i) => i.checked);
    if (checked.length === 0) return;
    try {
      await deleteShoppingItems(checked.map((c) => c.id));
    } catch (err) {
      setError(err.message);
      return;
    }
    load();
  }

  const remaining = items.filter((i) => !i.checked).length;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Shopping List</h1>
          <p className="text-muted-foreground text-sm mt-1">{remaining} items to buy</p>
        </div>
        {items.some((i) => i.checked) && (
          <Button variant="ghost" size="sm" onClick={clearChecked}>
            Clear checked
          </Button>
        )}
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {readableError(error)}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading…</div>
      ) : error && items.length === 0 ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Your list is empty"
          description="Plan a recipe to cook and its ingredients will show up here."
        />
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b">
              <button
                onClick={() => toggle(item)}
                className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center transition ${
                  item.checked
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border'
                }`}
              >
                {item.checked && <Check className="w-4 h-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    item.checked ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.quantity && (
                    <span>{[item.quantity, item.unit].filter(Boolean).join(' ')}</span>
                  )}
                  {(item.recipe_titles || []).length > 0 && (
                    <span className="truncate">· {item.recipe_titles.join(', ')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => remove(item)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}