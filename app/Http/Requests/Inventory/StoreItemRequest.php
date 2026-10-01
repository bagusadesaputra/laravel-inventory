<?php

namespace App\Http\Requests\Inventory;

use App\Enums\ItemUnit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreItemRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'sku' => ['required', 'string', 'max:64', Rule::unique('items', 'sku')],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', new Enum(ItemUnit::class)],
            'reorder_level' => ['required', 'integer', 'min:0'],
            // Written as the opening "in" movement so every stock figure has a log entry.
            'initial_stock' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
