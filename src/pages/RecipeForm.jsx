import React, { useState, useEffect } from 'react';
import { getRecipe, createRecipe, updateRecipe } from '@/api/recipes';
import { uploadImage } from '@/api/storage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import IngredientEditor from '@/components/recipe/IngredientEditor';
import StepsEditor from '@/components/recipe/StepsEditor';
import TagsInput from '@/components/recipe/TagsInput';
import ErrorState from '@/components/ErrorState';
import { readableError } from '@/lib/errors';

export default function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '',
    ingredients: [],
    steps: [],
    tags: [],
    notes: '',
    source: '',
    macros: { calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '' },
  });

  const load = () => {
    setLoadFailed(false);
    setError('');
    setLoading(true);
    (async () => {
      let r;
      try {
        r = await getRecipe(id);
      } catch (err) {
        setError(err.message);
        setLoadFailed(true);
        setLoading(false);
        return;
      }
      setForm({
        ...r,
        prep_time_minutes: r.prep_time_minutes || '',
        cook_time_minutes: r.cook_time_minutes || '',
        servings: r.servings || '',
        macros: {
          calories: r.macros?.calories ?? '',
          protein_g: r.macros?.protein_g ?? '',
          carbs_g: r.macros?.carbs_g ?? '',
          fat_g: r.macros?.fat_g ?? '',
          fiber_g: r.macros?.fiber_g ?? '',
        },
      });
      setLoading(false);
    })();
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      set('image_url', await uploadImage(file));
    } catch (err) {
      setError(err.message || 'Could not upload that photo.');
    } finally {
      setUploading(false);
      // Let the same file be picked again after a failure.
      e.target.value = '';
    }
  }

  async function save() {
    setSaving(true);
    const m = form.macros || {};
    const hasMacros = [m.calories, m.protein_g, m.carbs_g, m.fat_g, m.fiber_g].some((v) => v !== '' && v !== undefined);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      image_url: form.image_url,
      prep_time_minutes: Number(form.prep_time_minutes) || 0,
      cook_time_minutes: Number(form.cook_time_minutes) || 0,
      servings: Number(form.servings) || 0,
      ingredients: form.ingredients.filter((i) => i.name?.trim()),
      steps: form.steps.filter((s) => s.trim()),
      tags: form.tags,
      notes: form.notes,
      source: form.source,
      macros: hasMacros ? {
        calories: Number(m.calories) || null,
        protein_g: Number(m.protein_g) || null,
        carbs_g: Number(m.carbs_g) || null,
        fat_g: Number(m.fat_g) || null,
        fiber_g: Number(m.fiber_g) || null,
      } : null,
    };
    try {
      if (isEdit) {
        await updateRecipe(id, payload);
        navigate(-1);
      } else {
        const r = await createRecipe(payload);
        navigate(`/recipes/${r.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not save this recipe.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (loadFailed) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="pb-28 max-w-2xl mx-auto px-4 py-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl font-heading font-semibold mb-5">
        {isEdit ? 'Edit recipe' : 'New recipe'}
      </h1>

      <div className="space-y-5">
        <div>
          <Label>Photo</Label>
          <div className="mt-1.5">
            {form.image_url ? (
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                <Image src={form.image_url} fittingType="fill" className="w-full h-full" />
                <button
                  onClick={() => set('image_url', '')}
                  className="absolute top-2 right-2 bg-background/80 rounded-full w-8 h-8 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="block aspect-[16/10] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm cursor-pointer hover:bg-secondary">
                <span>{uploading ? 'Uploading…' : 'Tap to add a photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={onImage}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className="mt-1.5"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Recipe name"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            className="mt-1.5"
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="A short note about this dish"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Prep (min)</Label>
            <Input
              type="number"
              className="mt-1.5"
              value={form.prep_time_minutes}
              onChange={(e) => set('prep_time_minutes', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Cook (min)</Label>
            <Input
              type="number"
              className="mt-1.5"
              value={form.cook_time_minutes}
              onChange={(e) => set('cook_time_minutes', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Servings</Label>
            <Input
              type="number"
              className="mt-1.5"
              value={form.servings}
              onChange={(e) => set('servings', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label>Folders / Tags</Label>
          <div className="mt-1.5">
            <TagsInput value={form.tags} onChange={(v) => set('tags', v)} />
          </div>
        </div>

        <div>
          <Label>Ingredients</Label>
          <div className="mt-1.5">
            <IngredientEditor value={form.ingredients} onChange={(v) => set('ingredients', v)} />
          </div>
        </div>

        <div>
          <Label>Steps</Label>
          <div className="mt-1.5">
            <StepsEditor value={form.steps} onChange={(v) => set('steps', v)} />
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            className="mt-1.5"
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Tips, substitutions..."
          />
        </div>

        <div>
          <Label>Source URL</Label>
          <Input
            className="mt-1.5"
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Macros (for all servings combined — optional)</Label>
          <div className="grid grid-cols-2 gap-3 mt-1.5 sm:grid-cols-3">
            {[
              { key: 'calories', label: 'Calories (kcal)' },
              { key: 'protein_g', label: 'Protein (g)' },
              { key: 'carbs_g', label: 'Carbs (g)' },
              { key: 'fat_g', label: 'Fat (g)' },
              { key: 'fiber_g', label: 'Fiber (g)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.macros?.[key] ?? ''}
                  onChange={(e) => set('macros', { ...form.macros, [key]: e.target.value })}
                  placeholder="—"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {readableError(error)}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={save} disabled={saving || uploading || !form.title.trim()} className="w-full">
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? 'Saving…' : 'Save recipe'}
        </Button>
      </div>
    </div>
  );
}