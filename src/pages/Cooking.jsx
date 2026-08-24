import React, { useEffect, useState } from 'react';
import { getPlan, updatePlan } from '@/api/cookPlans';
import { getRecipe, updateRecipe } from '@/api/recipes';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, List, Eye, Clock, Users, Pencil } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useWakeLock } from '@/hooks/useWakeLock';
import ErrorState from '@/components/ErrorState';
import { readableError } from '@/lib/errors';

export default function Cooking() {
  const { planId, id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [plan, setPlan] = useState(null);
  const [tab, setTab] = useState('steps');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editStep, setEditStep] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useWakeLock(true);

  useEffect(() => {
    load();
  }, [planId, id]);

  useEffect(() => {
    if (recipe) localStorage.setItem(`cookStep:${recipe.id}`, String(step));
  }, [step, recipe]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      let r;
      if (planId) {
        const p = await getPlan(planId);
        r = await getRecipe(p.recipe_id);
        setPlan(p);
      } else {
        r = await getRecipe(id);
      }
      setRecipe(r);
      const saved = parseInt(localStorage.getItem(`cookStep:${r.id}`), 10);
      if (!isNaN(saved) && saved >= 0 && saved < (r.steps || []).length) setStep(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    if (plan) {
      try {
        await updatePlan(plan.id, { status: 'done' });
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    if (recipe) localStorage.removeItem(`cookStep:${recipe.id}`);
    navigate('/plan');
  }

  function openEdit() {
    setEditStep(steps[step] || '');
    setEditNotes(recipe.notes || '');
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    setError('');
    const newSteps = [...steps];
    newSteps[step] = editStep;
    try {
      const updated = await updateRecipe(recipe.id, { steps: newSteps, notes: editNotes });
      setRecipe({ ...recipe, steps: updated.steps, notes: updated.notes });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (!recipe) return <ErrorState message={error} onRetry={load} />;

  const steps = recipe.steps || [];
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1" />
        <div className="flex bg-secondary rounded-full p-1 text-sm">
          <button
            onClick={() => setTab('steps')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition ${
              tab === 'steps' ? 'bg-background shadow' : 'text-muted-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            Steps
          </button>
          <button
            onClick={() => setTab('overview')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition ${
              tab === 'overview' ? 'bg-background shadow' : 'text-muted-foreground'
            }`}
          >
            <Eye className="w-4 h-4" />
            Overview
          </button>
        </div>
      </div>


      <h1 className="text-2xl font-heading font-semibold">{recipe.title}</h1>
      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
        {totalTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {totalTime}m
          </span>
        )}
        {recipe.servings > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {readableError(error)}
        </div>
      )}

      {tab === 'steps' ? (
        steps.length === 0 ? (
          <p className="text-muted-foreground mt-8 text-center">No steps added.</p>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="bg-card rounded-2xl p-6 border min-h-[40vh] flex flex-col relative">
              <button
                onClick={openEdit}
                className="absolute top-4 right-4 text-muted-foreground/60 hover:text-muted-foreground transition"
                aria-label="Edit step"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mb-4">
                {step + 1}
              </span>
              <p className="text-lg leading-relaxed flex-1 whitespace-pre-wrap pr-6">{steps[step]}</p>
              {recipe.notes && (
                <p className="text-sm text-muted-foreground italic mt-4 pt-4 border-t">
                  {recipe.notes}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              {step < steps.length - 1 ? (
                <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button className="flex-1" onClick={finish}>
                  <Check className="w-4 h-4 mr-1" />
                  Done cooking
                </Button>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="mt-5">
          {recipe.image_url && (
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-muted mb-5">
              <Image src={recipe.image_url} fittingType="fill" className="w-full h-full" />
            </div>
          )}
          {recipe.description && (
            <p className="text-muted-foreground text-sm mb-5">{recipe.description}</p>
          )}
          {recipe.macros && Object.values(recipe.macros).some((v) => v !== null && v !== undefined) && (() => {
            const m = recipe.macros;
            const servings = recipe.servings || 1;
            const items = [
              { label: 'Calories', value: m.calories, unit: 'kcal' },
              { label: 'Protein', value: m.protein_g, unit: 'g' },
              { label: 'Carbs', value: m.carbs_g, unit: 'g' },
              { label: 'Fat', value: m.fat_g, unit: 'g' },
              { label: 'Fiber', value: m.fiber_g, unit: 'g' },
            ].filter((i) => i.value !== null && i.value !== undefined);
            return items.length ? (
              <div className="mb-5">
                <h2 className="font-heading text-lg mb-2">
                  Nutrition {servings > 1 ? <span className="text-sm font-normal text-muted-foreground">per serving</span> : null}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {items.map(({ label, value, unit }) => (
                    <div
                      key={label}
                      className="flex-1 min-w-[6rem] max-w-[8rem] bg-secondary rounded-xl px-3 py-2 text-center"
                    >
                      <p className="text-base font-semibold">
                        {servings > 1 ? Math.round((value / servings) * 10) / 10 : value}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      {servings > 1 && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{value}{unit} total</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
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
          <h2 className="font-heading text-lg mt-5 mb-3">Method</h2>
          <ol className="space-y-4">
            {steps.map((s, i) => (
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

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit step {step + 1} & notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Step {step + 1}</label>
              <Textarea
                className="mt-1.5"
                value={editStep}
                onChange={(e) => setEditStep(e.target.value)}
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                className="mt-1.5"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Add a quick note…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}