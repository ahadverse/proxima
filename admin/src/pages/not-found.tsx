import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';

export function NotFoundPage() {
  return (
    <div className="panel">
      <EmptyState
        icon={<Compass />}
        title="Page not found"
        text="This admin page does not exist."
        action={
          <Button asChild variant="secondary">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
