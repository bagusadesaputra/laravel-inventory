import { Head, usePage } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import Heading from '@/components/heading';
import ItemForm from '@/components/inventory/item-form';
import type { Category, Item } from '@/types';

type PageProps = {
    item: Item;
    categories: Category[];
    units: string[];
};

export default function EditItem() {
    const { item, categories, units } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`Ubah ${item.name}`} />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    variant="small"
                    title="Ubah barang"
                    description="Stok tidak dapat diubah di sini; catat sebagai pergerakan stok"
                />

                <ItemForm item={item} categories={categories} units={units} />
            </div>
        </>
    );
}

EditItem.layout = {
    breadcrumbs: [
        {
            title: 'Barang',
            href: ItemController.index.url(),
        },
        {
            title: 'Ubah barang',
            href: ItemController.edit.url(1),
        },
    ],
};
