import { Form, Head, router, usePage } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/Inventory/CategoryController';
import { dashboard } from '@/routes';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { canManage } from '@/lib/inventory';
import { useState } from 'react';
import type { Auth, Category } from '@/types';

type PageProps = {
    auth: Auth;
    categories: Category[];
};

export default function CategoriesIndex() {
    const { auth, categories } = usePage<PageProps>().props;
    const manage = canManage(auth.user);
    const [editingId, setEditingId] = useState<number | null>(null);

    const confirmDelete = (category: Category) => {
        if (
            window.confirm(
                `Delete the category "${category.name}"? This cannot be undone.`,
            )
        ) {
            router.delete(CategoryController.destroy.url(category.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    variant="small"
                    title="Categories"
                    description="Group items so the catalogue stays readable"
                />

                {manage && (
                    <Form
                        {...CategoryController.store.form()}
                        options={{ preserveScroll: true }}
                        className="flex max-w-md items-end gap-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="new-category">
                                        New category
                                    </Label>
                                    <Input
                                        id="new-category"
                                        name="name"
                                        required
                                        maxLength={255}
                                        placeholder="Category name"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <Button disabled={processing}>Add</Button>
                            </>
                        )}
                    </Form>
                )}

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left">
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Items
                                </th>
                                {manage && (
                                    <th className="px-4 py-2 text-right font-medium">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={manage ? 3 : 2}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No categories yet.
                                    </td>
                                </tr>
                            )}

                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b last:border-0"
                                >
                                    <td
                                        className="px-4 py-2"
                                        colSpan={
                                            editingId === category.id ? 3 : 1
                                        }
                                    >
                                        {editingId === category.id ? (
                                            <Form
                                                {...CategoryController.update.form(
                                                    category.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                                onSuccess={() =>
                                                    setEditingId(null)
                                                }
                                                className="flex flex-wrap items-center gap-2"
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <Input
                                                            name="name"
                                                            defaultValue={
                                                                category.name
                                                            }
                                                            required
                                                            maxLength={255}
                                                            className="max-w-xs"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEditingId(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </Form>
                                        ) : (
                                            category.name
                                        )}
                                    </td>

                                    {editingId !== category.id && (
                                        <>
                                            <td className="px-4 py-2 text-right text-muted-foreground">
                                                {category.items_count ?? 0}
                                            </td>

                                            {manage && (
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setEditingId(
                                                                    category.id,
                                                                )
                                                            }
                                                        >
                                                            Rename
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    category,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: CategoryController.index.url(),
        },
    ],
};
