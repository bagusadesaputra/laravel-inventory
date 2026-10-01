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
            <Head title={`Edit ${item.name}`} />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    variant="small"
                    title="Edit item"
                    description="Stock is not editable here; record it as a movement instead"
                />

                <ItemForm item={item} categories={categories} units={units} />
            </div>
        </>
    );
}

EditItem.layout = {
    breadcrumbs: [
        {
            title: 'Items',
            href: ItemController.index.url(),
        },
        {
            title: 'Edit item',
            href: ItemController.edit.url(1),
        },
    ],
};
