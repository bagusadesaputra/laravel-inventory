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
            <Head title="Items" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Items"
                        description="Everything the business keeps in stock"
                    />

                    {canManage(auth.user) && (
                        <Button asChild>
                            <Link href={ItemController.create.url()}>
                                New item
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
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    name="search"
                                    defaultValue={filters.search ?? ''}
                                    placeholder="Name or SKU"
                                />
                            </div>

                            <div className="grid w-56 gap-2">
                                <Label htmlFor="category">Category</Label>
                                <NativeSelect
                                    id="category"
                                    name="category"
                                    defaultValue={filters.category ?? ''}
                                >
                                    <option value="">All categories</option>
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
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">
                                    Category
                                </th>
                                <th className="px-4 py-2 font-medium">Unit</th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Stock
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
                                        No items match these filters.
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
                                            {isLowStock(item) ? 'Low' : 'OK'}
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
            title: 'Items',
            href: ItemController.index.url(),
        },
    ],
};
