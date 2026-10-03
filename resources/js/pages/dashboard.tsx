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
            title: 'Barang dalam katalog',
            value: stats.totalItems,
            description: 'Jumlah barang yang dilacak',
        },
        {
            title: 'Stok menipis',
            value: stats.lowStock,
            description: 'Stok sudah mencapai atau di bawah stok minimum',
        },
        {
            title: 'Pergerakan hari ini',
            value: stats.movementsToday,
            description: 'Stok masuk dan stok keluar yang dicatat',
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
                        <CardTitle>Pergerakan stok terbaru</CardTitle>
                        <CardDescription>
                            15 entri terakhir stok masuk dan stok keluar dari
                            seluruh barang
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-2 font-medium">
                                            Kapan
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Barang
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Jenis
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Stok setelah
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Dicatat oleh
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
                                                Belum ada pergerakan stok yang
                                                dicatat.
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
                                                        ? 'Stok Keluar'
                                                        : 'Stok Masuk'}
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
