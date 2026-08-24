import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  return (
    <Link to={`/recipes/${recipe.id}`} className="group block">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-2 relative">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            fittingType="fill"
            className="w-full h-full transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">
            🍽️
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm leading-snug line-clamp-2">{recipe.title}</h3>
      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
        {totalTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalTime}m
          </span>
        )}
        {recipe.servings > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {recipe.servings}
          </span>
        )}
      </div>
      {(recipe.tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {(recipe.tags || []).slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}