import { Form } from '@inertiajs/react';
import ItemController from '@/actions/App/Http/Controllers/Inventory/ItemController';
import InputError from '@/components/input-error';
import { NativeSelect } from '@/components/native-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category, Item } from '@/types';

type Props = {
    categories: Category[];
    units: string[];
    item?: Item;
};

export default function ItemForm({ categories, units, item }: Props) {
    return (
        <Form
            {...(item
                ? ItemController.update.form(item.id)
                : ItemController.store.form())}
            options={{ preserveScroll: true }}
            className="max-w-2xl space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            defaultValue={item?.sku}
                            required
                            maxLength={64}
                            placeholder="SKU-0001"
                        />
                        <InputError className="mt-2" message={errors.sku} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama barang</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={item?.name}
                            required
                            maxLength={255}
                            placeholder="Nama barang"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Kategori</Label>
                        <NativeSelect
                            id="category_id"
                            name="category_id"
                            defaultValue={item?.category_id ?? ''}
                            required
                        >
                            <option value="" disabled>
                                Pilih kategori
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </NativeSelect>
                        <InputError
                            className="mt-2"
                            message={errors.category_id}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit">Satuan</Label>
                        <NativeSelect
                            id="unit"
                            name="unit"
                            defaultValue={item?.unit ?? 'pcs'}
                            required
                        >
                            {units.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit.charAt(0).toUpperCase() +
                                        unit.slice(1)}
                                </option>
                            ))}
                        </NativeSelect>
                        <InputError className="mt-2" message={errors.unit} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reorder_level">Stok minimum</Label>
                        <Input
                            id="reorder_level"
                            name="reorder_level"
                            type="number"
                            min={0}
                            defaultValue={item?.reorder_level ?? 0}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Beri peringatan saat stok turun ke level ini.
                            Gunakan 0 untuk mematikan peringatan.
                        </p>
                        <InputError
                            className="mt-2"
                            message={errors.reorder_level}
                        />
                    </div>

                    {!item && (
                        <div className="grid gap-2">
                            <Label htmlFor="initial_stock">Stok awal</Label>
                            <Input
                                id="initial_stock"
                                name="initial_stock"
                                type="number"
                                min={0}
                                defaultValue={0}
                            />
                            <p className="text-sm text-muted-foreground">
                                Dicatat sebagai entri pertama pada buku stok.
                            </p>
                            <InputError
                                className="mt-2"
                                message={errors.initial_stock}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {item ? 'Simpan perubahan' : 'Tambah barang'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
