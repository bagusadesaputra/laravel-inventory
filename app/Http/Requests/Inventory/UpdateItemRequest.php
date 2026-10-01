<?php

namespace App\Http\Requests\Inventory;

use App\Enums\ItemUnit;
use App\Models\Item;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Stock is deliberately absent: it only ever changes through a recorded movement.
 */
class UpdateItemRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Item|null $item */
        $item = $this->route('item');

        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'sku' => ['required', 'string', 'max:64', Rule::unique('items', 'sku')->ignore($item?->getKey())],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', new Enum(ItemUnit::class)],
            'reorder_level' => ['required', 'integer', 'min:0'],
        ];
    }
}
