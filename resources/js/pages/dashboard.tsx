import { Head, Link } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import { dashboard } from '@/routes';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDateTime, movementDelta } from '@/lib/inventory';
import type { RecentStockMovement } from '@/types';

type Stats = {
    totalItems: number;
    lowStock: number;
    movementsToday: number;
};

export default function Dashboard({
    stats,
    movements,
}: {
    stats: Stats;
    movements: RecentStockMovement[];
}) {
    const cards = [
        {
            title: 'Items in catalogue',
            value: stats.totalItems,
            description: 'Distinct items tracked',
        },
        {
            title: 'Low stock',
            value: stats.lowStock,
            description: 'At or below the reorder level',
        },
        {
            title: 'Movements today',
            value: stats.movementsToday,
            description: 'Stock in and stock out recorded',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardDescription>{card.title}</CardDescription>
                                <CardTitle className="text-3xl">
                                    {card.value}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {card.description}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent stock movements</CardTitle>
                        <CardDescription>
                            The last 15 stock in and stock out entries across
                            every item
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-2 font-medium">
                                            When
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Item
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Stock after
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Recorded by
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {movements.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No stock movements recorded yet.
                                            </td>
                                        </tr>
                                    )}

                                    {movements.map((movement) => (
                                        <tr
                                            key={movement.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                                                {formatDateTime(
                                                    movement.created_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Link
                                                    href={ItemController.show.url(
                                                        movement.item.id,
                                                    )}
                                                    className="font-medium hover:underline"
                                                >
                                                    {movement.item.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge
                                                    variant={
                                                        movement.type === 'out'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {movement.type === 'out'
                                                        ? 'Stock out'
                                                        : 'Stock in'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {movementDelta(movement)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium">
                                                {movement.stock_after}
                                            </td>
                                            <td className="px-4 py-2">
                                                {movement.user?.name ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
