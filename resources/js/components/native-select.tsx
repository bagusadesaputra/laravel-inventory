import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A native <select> so the field submits with the rest of the form.
 */
function NativeSelect({
    className,
    children,
    ...props
}: React.ComponentProps<'select'>) {
    return (
        <select
            data-slot="select"
            className={cn(
                'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export { NativeSelect };
