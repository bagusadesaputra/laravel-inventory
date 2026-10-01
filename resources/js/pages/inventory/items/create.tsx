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
            <Head title="New item" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    variant="small"
                    title="New item"
                    description="Add an item to the inventory catalogue"
                />

                <ItemForm categories={categories} units={units} />
            </div>
        </>
    );
}

CreateItem.layout = {
    breadcrumbs: [
        {
            title: 'Items',
            href: ItemController.index.url(),
        },
        {
            title: 'New item',
            href: ItemController.create.url(),
        },
    ],
};
