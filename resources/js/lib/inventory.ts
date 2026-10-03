import type { User } from '@/types';

/**
 * Admins and managers own the master data; everyone records stock movements.
 */
export function canManage(user: User | null | undefined): boolean {
    return user?.role === 'admin' || user?.role === 'manager';
}

/**
 * Whether an item is at or below its reorder level.
 */
export function isLowStock(item: {
    stock: number;
    reorder_level: number;
}): boolean {
    return item.reorder_level > 0 && item.stock <= item.reorder_level;
}

/**
 * Laravel writes timestamps as "Y-m-d H:i:s", which Safari will not parse.
 */
export function formatDateTime(value: string): string {
    return new Date(value.replace(' ', 'T')).toLocaleString('id-ID');
}

/**
 * Signed quantity for a movement row.
 */
export function movementDelta(movement: {
    type: 'in' | 'out';
    quantity: number;
}): string {
    return movement.type === 'out'
        ? `-${movement.quantity}`
        : `+${movement.quantity}`;
}
