import React from 'react';
import { CloudOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { readableError } from '@/lib/errors';

/**
 * Shown when a load fails. Without this an offline or misconfigured backend
 * looks exactly like an empty account — "No recipes yet" over data that is
 * really still sitting in Supabase.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon={CloudOff}
      title="Couldn't load your data"
      description={readableError(message)}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCw className="w-4 h-4 mr-1.5" />
            Try again
          </Button>
        )
      }
    />
  );
}
