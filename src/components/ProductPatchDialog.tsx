'use client';

import { useState, type FormEvent } from 'react';
import type { Product } from './ProductsTable';

type ProductPatchDialogProps = {
  product: Product;
  onClose: () => void;
  onSubmit: (values: { price?: string; quantity?: string }) => Promise<void>;
};

export default function ProductPatchDialog({
  product,
  onClose,
  onSubmit,
}: ProductPatchDialogProps) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        ...(price !== '' ? { price } : {}),
        ...(quantity !== '' ? { quantity } : {}),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to partially update this product.',
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
        aria-labelledby="product-patch-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/15 sm:p-8"
      >
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Partial update
        </p>
        <h2 id="product-patch-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Change {product.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Leave a field empty to keep its current value.
        </p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Price
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder={`Current: ${product.price}`}
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Quantity
            <input
              type="number"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={`Current: ${product.quantity}`}
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
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
              className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Updating…' : 'Apply partial update'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
