import { FormEvent } from 'react';
import { Package, Plus, Search, Trash2 } from 'lucide-react';

export type ProductSort =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'category';

export type ProductQuery =
  | { type: 'all' | 'in-stock' | 'limited' | 'out-of-stock' | 'sort'; value: string }
  | { type: 'id' | 'name' | 'category' | 'less' | 'greater'; value: string }
  | { type: 'range'; value: string; minPrice: string; maxPrice: string };

type ProductToolbarProps = {
  query: ProductQuery;
  onQueryChange: (value: ProductQuery) => void;
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  onRunQuery: () => void;
  loading: boolean;
  resultCount: number;
  inventoryValue: string | null;
  onAddProduct: () => void;
  categoryToDelete: string;
  onCategoryToDeleteChange: (value: string) => void;
  onDeleteCategory: () => void;
};

type QueryType = ProductQuery['type'];
type ValueQueryType = 'id' | 'name' | 'category' | 'less' | 'greater';

const OPERATION_GROUPS: { label: string; options: { value: QueryType; label: string }[] }[] = [
  {
    label: 'Browse',
    options: [
      { value: 'all', label: 'Get all products' },
      { value: 'sort', label: 'Sort products' },
    ],
  },
  {
    label: 'Find',
    options: [
      { value: 'id', label: 'Get product by ID' },
      { value: 'name', label: 'Get product by exact name' },
      { value: 'category', label: 'Get products by category' },
    ],
  },
  {
    label: 'Price',
    options: [
      { value: 'less', label: 'Price less than' },
      { value: 'greater', label: 'Price greater than' },
      { value: 'range', label: 'Price range' },
    ],
  },
  {
    label: 'Stock',
    options: [
      { value: 'in-stock', label: 'Products in stock (> 10)' },
      { value: 'limited', label: 'Limited stock (1–10)' },
      { value: 'out-of-stock', label: 'Out of stock (0)' },
    ],
  },
];

const VALUE_FIELDS: Record<
  ValueQueryType,
  { label: string; placeholder: string; inputType: 'number' | 'text'; step?: string }
> = {
  id: { label: 'Product ID', placeholder: 'Product ID', inputType: 'number' },
  name: { label: 'Exact product name', placeholder: 'Exact product name', inputType: 'text' },
  category: { label: 'Category name', placeholder: 'Category name', inputType: 'text' },
  less: { label: 'Price', placeholder: 'Price', inputType: 'number', step: '0.01' },
  greater: { label: 'Price', placeholder: 'Price', inputType: 'number', step: '0.01' },
};

const NO_INPUT_HINTS: Partial<Record<QueryType, string>> = {
  all: 'Returns every product. No input needed.',
  'in-stock': 'Returns products with more than 10 units in stock.',
  limited: 'Returns products with 1–10 units in stock.',
  'out-of-stock': 'Returns products with 0 units in stock.',
};

const inputClass =
  'min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

export default function ProductToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  onRunQuery,
  loading,
  resultCount,
  inventoryValue,
  onAddProduct,
  categoryToDelete,
  onCategoryToDeleteChange,
  onDeleteCategory,
}: ProductToolbarProps) {
  const updateQueryType = (type: QueryType) => {
    if (type === 'range') {
      onQueryChange({ type, value: '', minPrice: '', maxPrice: '' });
    } else {
      onQueryChange({ type, value: '' });
    }
  };

  const valueField = query.type in VALUE_FIELDS ? VALUE_FIELDS[query.type as ValueQueryType] : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRunQuery();
  };

  return (
    <header>
      <div className="flex flex-col gap-5 border-b border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Package size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-500">
              {resultCount} product{resultCount === 1 ? '' : 's'} returned by the API
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end">
          <div className="sm:text-right">
            <p className="text-xs text-slate-500">Inventory value</p>
            <p className="text-sm font-semibold tabular-nums text-slate-700">
              {inventoryValue ?? 'Not available'}
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onAddProduct}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} aria-hidden="true" />
            Add product
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:px-8"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="lg:w-64 lg:shrink-0">
            <label className="sr-only" htmlFor="product-operation">
              Select a backend product operation
            </label>
            <select
              id="product-operation"
              value={query.type}
              onChange={(event) => updateQueryType(event.target.value as QueryType)}
              className={`${inputClass} text-slate-700`}
            >
              {OPERATION_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="min-w-0 flex-1">
            {query.type === 'range' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="sr-only" htmlFor="product-min-price">Minimum price</label>
                  <input
                    id="product-min-price"
                    type="number"
                    required
                    step="0.01"
                    value={query.minPrice}
                    onChange={(event) => onQueryChange({ ...query, minPrice: event.target.value })}
                    placeholder="Minimum price"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="product-max-price">Maximum price</label>
                  <input
                    id="product-max-price"
                    type="number"
                    required
                    step="0.01"
                    value={query.maxPrice}
                    onChange={(event) => onQueryChange({ ...query, maxPrice: event.target.value })}
                    placeholder="Maximum price"
                    className={inputClass}
                  />
                </div>
              </div>
            ) : valueField ? (
              <div className="relative">
                <label className="sr-only" htmlFor="product-query-value">
                  {valueField.label}
                </label>
                {query.type === 'name' && (
                  <Search
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  />
                )}
                <input
                  id="product-query-value"
                  type={valueField.inputType}
                  required
                  step={valueField.step}
                  value={query.value}
                  onChange={(event) => onQueryChange({ ...query, value: event.target.value })}
                  placeholder={valueField.placeholder}
                  className={`${inputClass} ${query.type === 'name' ? 'pl-10' : ''}`}
                />
              </div>
            ) : query.type === 'sort' ? (
              <>
                <label className="sr-only" htmlFor="product-sort">Sort products</label>
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(event) => onSortChange(event.target.value as ProductSort)}
                  className={`${inputClass} text-slate-700`}
                >
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="category">Grouped by category</option>
                </select>
              </>
            ) : (
              <p className="flex min-h-10 items-center text-sm text-slate-500">
                {NO_INPUT_HINTS[query.type]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-10 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50 lg:shrink-0"
          >
            {loading ? 'Loading…' : 'Get products'}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="delete-category">
            Delete a category
          </label>
          <p className="text-xs text-slate-500">Removes every product in the category you enter.</p>
        </div>
        <div className="flex w-full gap-2 sm:max-w-md">
          <input
            id="delete-category"
            value={categoryToDelete}
            onChange={(event) => onCategoryToDeleteChange(event.target.value)}
            placeholder="Exact category name"
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            disabled={loading || !categoryToDelete.trim()}
            onClick={onDeleteCategory}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </header>
  );
}