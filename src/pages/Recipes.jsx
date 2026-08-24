import React, { useEffect, useState } from 'react';
import { listRecipes } from '@/api/recipes';
import { Link } from 'react-router-dom';
import { Plus, Search, UtensilsCrossed } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRecipes(await listRecipes());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tags = ['All', ...Array.from(new Set(recipes.flatMap((r) => r.tags || [])))];
  const filtered = recipes.filter((r) => {
    const matchTag = activeTag === 'All' || (r.tags || []).includes(activeTag);
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto pb-24">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">My Recipes</h1>
          <p className="text-muted-foreground text-sm mt-1">{recipes.length} recipes</p>
        </div>
        <Button asChild>
          <Link to="/recipes/new">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Link>
        </Button>
      </header>

      <div className="relative mb-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
              activeTag === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={recipes.length === 0 ? 'No recipes yet' : 'Nothing found'}
          description={
            recipes.length === 0
              ? 'Add your first recipe to get started.'
              : 'Try a different search or folder.'
          }
          action={
            <Button asChild>
              <Link to="/recipes/new">
                <Plus className="w-4 h-4 mr-1" />
                Add recipe
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}