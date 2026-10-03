import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import StockMovementController from '@/actions/App/Http/Controllers/Inventory/StockMovementController';
import InputError from '@/components/input-error';
import Pagination from '@/components/inventory/pagination';
import { NativeSelect } from '@/components/native-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    canManage,
    formatDateTime,
    isLowStock,
    movementDelta,
} from '@/lib/inventory';
import type { Auth, Item, Paginated, StockMovement } from '@/types';

type PageProps = {
    auth: Auth;
    item: Item;
    movements: Paginated<StockMovement>;
};

export default function ItemShow() {
    const { auth, item, movements } = usePage<PageProps>().props;
    const manage = canManage(auth.user);

    const confirmDelete = () => {
        if (
            window.confirm(
                `Hapus "${item.name}"? Ini hanya bisa dilakukan selama barang belum memiliki riwayat stok.`,
            )
        ) {
            router.delete(ItemController.destroy.url(item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={item.name} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {item.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-mono">{item.sku}</span>
                            {' · '}
                            {item.category?.name ?? 'Tanpa kategori'}
                        </p>
                    </div>

                    {manage && (
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={ItemController.edit.url(item.id)}>
                                    Ubah
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                            >
                                Hapus
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Stok saat ini</CardDescription>
                            <CardTitle className="text-3xl">
                                {item.stock}{' '}
                                <span className="text-base font-medium text-muted-foreground uppercase">
                                    {item.unit}
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Stok minimum</CardDescription>
                            <CardTitle className="text-3xl">
                                {item.reorder_level}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                            <CardTitle>
                                <Badge
                                    variant={
                                        isLowStock(item)
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                >
                                    {isLowStock(item) ? 'Stok menipis' : 'Aman'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Catat pergerakan stok</CardTitle>
                        <CardDescription>
                            Setiap perubahan dicatat pada buku stok dengan nama
                            Anda.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            {...StockMovementController.store.form(item.id)}
                            options={{ preserveScroll: true }}
                            className="grid gap-4 md:grid-cols-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Jenis</Label>
                                        <NativeSelect
                                            id="type"
                                            name="type"
                                            defaultValue="in"
                                        >
                                            <option value="in">
                                                Stok Masuk
                                            </option>
                                            <option value="out">
                                                Stok Keluar
                                            </option>
                                        </NativeSelect>
                                        <InputError message={errors.type} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">Jumlah</Label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min={1}
                                            required
                                            placeholder="0"
                                        />
                                        <InputError message={errors.quantity} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="note">Catatan</Label>
                                        <Input
                                            id="note"
                                            name="note"
                                            maxLength={255}
                                            placeholder="Opsional"
                                        />
                                        <InputError message={errors.note} />
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Catat
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Buku stok</CardTitle>
                        <CardDescription>
                            Catatan kronologis setiap perubahan stok
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-2 font-medium">
                                            Kapan
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
                                            Catatan
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Dicatat oleh
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {movements.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                Belum ada pergerakan yang
                                                dicatat.
                                            </td>
                                        </tr>
                                    )}

                                    {movements.data.map((movement) => (
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
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {movement.note ?? '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {movement.user?.name ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination page={movements} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ItemShow.layout = {
    breadcrumbs: [
        {
            title: 'Barang',
            href: ItemController.index.url(),
        },
        {
            title: 'Detail barang',
            href: ItemController.show.url(1),
        },
    ],
};
