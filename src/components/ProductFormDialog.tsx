'use client';

import { useState, type FormEvent } from 'react';
import type { Product } from './ProductsTable';

type ProductFormDialogProps = {
  product: Product | null;
  onClose: () => void;
  onSubmit: (values: Omit<Product, 'id'>) => Promise<void>;
};

export default function ProductFormDialog({
  product,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [quantity, setQuantity] = useState(String(product?.quantity ?? 0));
  const [price, setPrice] = useState(String(product?.price ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        quantity: Number(quantity),
        price: Number(price),
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save this product.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/15 sm:p-8"
      >
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Product details
        </p>
        <h2 id="product-form-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          {product ? 'Edit product' : 'Add product'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep your inventory information up to date.
        </p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Wireless keyboard"
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Category
            <input
              maxLength={50}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Accessories"
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Quantity
              <input
                required
                type="number"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Price
              <input
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
