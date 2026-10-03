import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import { dashboard } from '@/routes';
import Heading from '@/components/heading';
import Pagination from '@/components/inventory/pagination';
import { NativeSelect } from '@/components/native-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { canManage, isLowStock } from '@/lib/inventory';
import type {
    Auth,
    Category,
    InventoryFilters,
    Item,
    Paginated,
} from '@/types';

type PageProps = {
    auth: Auth;
    items: Paginated<Item>;
    categories: Category[];
    filters: InventoryFilters;
};

export default function ItemsIndex() {
    const { auth, items, categories, filters } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Barang" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Barang"
                        description="Semua barang yang disimpan bisnis"
                    />

                    {canManage(auth.user) && (
                        <Button asChild>
                            <Link href={ItemController.create.url()}>
                                Barang baru
                            </Link>
                        </Button>
                    )}
                </div>

                <Form
                    {...ItemController.index.form()}
                    className="flex flex-wrap items-end gap-3"
                >
                    {({ processing }) => (
                        <>
                            <div className="grid min-w-56 flex-1 gap-2">
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    name="search"
                                    defaultValue={filters.search ?? ''}
                                    placeholder="Nama atau SKU"
                                />
                            </div>

                            <div className="grid w-56 gap-2">
                                <Label htmlFor="category">Kategori</Label>
                                <NativeSelect
                                    id="category"
                                    name="category"
                                    defaultValue={filters.category ?? ''}
                                >
                                    <option value="">Semua kategori</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                variant="secondary"
                            >
                                Filter
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    router.get(ItemController.index.url())
                                }
                            >
                                Reset
                            </Button>
                        </>
                    )}
                </Form>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left">
                                <th className="px-4 py-2 font-medium">SKU</th>
                                <th className="px-4 py-2 font-medium">Nama</th>
                                <th className="px-4 py-2 font-medium">
                                    Kategori
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Satuan
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Stok
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Barang tidak ditemukan.
                                    </td>
                                </tr>
                            )}

                            {items.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-4 py-2 font-mono text-xs">
                                        {item.sku}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Link
                                            href={ItemController.show.url(
                                                item.id,
                                            )}
                                            className="font-medium hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {item.category?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-2 uppercase">
                                        {item.unit}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium">
                                        {item.stock}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge
                                            variant={
                                                isLowStock(item)
                                                    ? 'destructive'
                                                    : 'outline'
                                            }
                                        >
                                            {isLowStock(item)
                                                ? 'Menipis'
                                                : 'OK'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={items} />
            </div>
        </>
    );
}

ItemsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Barang',
            href: ItemController.index.url(),
        },
    ],
};
