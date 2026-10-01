import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

export default function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
                {page.total} record(s)
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!page.prev_page_url}
                    onClick={() =>
                        page.prev_page_url && router.get(page.prev_page_url)
                    }
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {page.current_page} of {page.last_page}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!page.next_page_url}
                    onClick={() =>
                        page.next_page_url && router.get(page.next_page_url)
                    }
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
