import { Head, usePage } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import Heading from '@/components/heading';
import ItemForm from '@/components/inventory/item-form';
import type { Category } from '@/types';

type PageProps = {
    categories: Category[];
    units: string[];
};

export default function CreateItem() {
    const { categories, units } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Barang baru" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    variant="small"
                    title="Barang baru"
                    description="Tambahkan barang ke katalog inventori"
                />

                <ItemForm categories={categories} units={units} />
            </div>
        </>
    );
}

CreateItem.layout = {
    breadcrumbs: [
        {
            title: 'Barang',
            href: ItemController.index.url(),
        },
        {
            title: 'Barang baru',
            href: ItemController.create.url(),
        },
    ],
};
