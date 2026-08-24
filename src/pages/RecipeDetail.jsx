import React, { useEffect, useState } from 'react';
import { getRecipe, deleteRecipe } from '@/api/recipes';
import { createPlan } from '@/api/cookPlans';
import {
  listShoppingItems,
  createShoppingItem,
  updateShoppingItem,
} from '@/api/shoppingItems';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Pencil, Trash2, CalendarPlus, ChefHat } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ErrorState from '@/components/ErrorState';
import { readableError } from '@/lib/errors';

function combineQty(a, b) {
  const aNum = a && /^[\d.]+$/.test(a.trim());
  const bNum = b && /^[\d.]+$/.test(b.trim());
  if (aNum && bNum) return String(parseFloat(a) + parseFloat(b));
  return [a, b].filter(Boolean).join(' + ');
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRecipe(await getRecipe(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function planToCook() {
    setPlanning(true);
    setError('');
    try {
      await createPlan({ recipe_id: recipe.id, status: 'planned' });
      const existing = await listShoppingItems();
      for (const ing of recipe.ingredients || []) {
        if (!ing.name) continue;
        const key = ing.name.trim().toLowerCase();
        const match = existing.find(
          (s) => s.name.trim().toLowerCase() === key && (s.unit || '') === (ing.unit || '')
        );
        if (match) {
          await updateShoppingItem(match.id, {
            quantity: combineQty(match.quantity, ing.quantity),
            recipe_ids: [...(match.recipe_ids || []), recipe.id],
            recipe_titles: [...(match.recipe_titles || []), recipe.title],
          });
        } else {
          const created = await createShoppingItem({
            name: ing.name,
            quantity: ing.quantity || '',
            unit: ing.unit || '',
            category: ing.category || 'Other',
            checked: false,
            recipe_ids: [recipe.id],
            recipe_titles: [recipe.title],
          });
          existing.push(created);
        }
      }
      navigate('/plan');
    } catch (err) {
      setError(err.message);
    } finally {
      setPlanning(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(recipe.id);
    } catch (err) {
      setError(err.message);
      return;
    }
    navigate('/');
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (!recipe) {
    return error ? (
      <ErrorState message={error} onRetry={load} />
    ) : (
      <div className="p-8 text-center">Recipe not found</div>
    );
  }
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <div className="relative aspect-[16/10] rounded-b-2xl overflow-hidden bg-muted">
        {recipe.image_url ? (
          <Image src={recipe.image_url} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-5">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          {recipe.prep_time_minutes > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Prep {recipe.prep_time_minutes}m
            </span>
          )}
          {recipe.cook_time_minutes > 0 && (
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" />
              Cook {recipe.cook_time_minutes}m
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </span>
          )}
        </div>

        {(recipe.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {readableError(error)}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <Button onClick={planToCook} disabled={planning} className="flex-1">
            <CalendarPlus className="w-4 h-4 mr-1.5" />
            {planning ? 'Planning…' : 'Plan to Cook'}
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/recipes/${recipe.id}/edit`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={remove}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>

        {recipe.source && (
          <a
            href={recipe.source}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline mt-3 inline-block"
          >
            View source
          </a>
        )}
      </div>

      {recipe.macros && Object.values(recipe.macros).some((v) => v !== null && v !== undefined) && (() => {
        const m = recipe.macros;
        const servings = recipe.servings || 1;
        const items = [
          { label: 'Calories', total: m.calories, unit: 'kcal' },
          { label: 'Protein', total: m.protein_g, unit: 'g' },
          { label: 'Carbs', total: m.carbs_g, unit: 'g' },
          { label: 'Fat', total: m.fat_g, unit: 'g' },
          { label: 'Fiber', total: m.fiber_g, unit: 'g' },
        ].filter((i) => i.total !== null && i.total !== undefined);
        return (
          <div className="px-4 mb-6">
            <h2 className="font-heading text-lg mb-1">Nutrition</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Per serving ({servings > 1 ? `total ÷ ${servings}` : '1 serving'})
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {items.map(({ label, total, unit }) => (
                <div
                  key={label}
                  className="flex-1 min-w-[7.5rem] max-w-[9.5rem] bg-secondary rounded-xl px-3 py-2.5 text-center"
                >
                  <p className="text-lg font-semibold">
                    {servings > 1 ? Math.round((total / servings) * 10) / 10 : total}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="px-4">
        <h2 className="font-heading text-lg mb-3">Ingredients</h2>
        <ul className="space-y-1.5">
          {(recipe.ingredients || []).map((ing, i) => (
            <li key={i} className="text-sm flex justify-between">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">
                {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {(recipe.steps || []).length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-heading text-lg mb-3">Method</h2>
          <ol className="space-y-4">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {recipe.notes && (
        <div className="px-4 mt-6">
          <h2 className="font-heading text-lg mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe.notes}</p>
        </div>
      )}
    </div>
  );
}