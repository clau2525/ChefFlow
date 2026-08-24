import React, { useEffect, useState } from 'react';
import { listPlans, deletePlan } from '@/api/cookPlans';
import { getRecipesByIds } from '@/api/recipes';
import { Link } from 'react-router-dom';
import { ChefHat, Play, Trash2, Clock, Users } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { readableError } from '@/lib/errors';

export default function Plan() {
  const [plans, setPlans] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listPlans({ status: 'planned' });
      setPlans(data);
      const ids = Array.from(new Set(data.map((p) => p.recipe_id)));
      const map = {};
      for (const r of await getRecipesByIds(ids)) {
        map[r.id] = r;
      }
      setRecipes(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(planId) {
    try {
      await deletePlan(planId);
    } catch (err) {
      setError(err.message);
      return;
    }
    load();
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24">
      <header className="mb-6">
        <h1 className="text-3xl font-heading font-semibold tracking-tight">To Cook Next</h1>
        <p className="text-muted-foreground text-sm mt-1">{plans.length} planned</p>
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {readableError(error)}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading…</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Nothing planned yet"
          description="Open a recipe and tap “Plan to Cook” to queue it here."
        />
      ) : (
        <div className="space-y-3">
          {plans.map((p) => {
            const r = recipes[p.recipe_id];
            if (!r) return null;
            const totalTime = (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0);
            return (
              <div
                key={p.id}
                className="flex gap-3 items-center bg-card rounded-2xl p-3 border"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {r.image_url ? (
                    <Image src={r.image_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium leading-snug truncate">{r.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {totalTime > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalTime}m
                      </span>
                    )}
                    {r.servings > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {r.servings}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" asChild>
                      <Link to={`/plan/${p.id}/cook`}>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Start cooking
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}