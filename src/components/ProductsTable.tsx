import { useEffect, useRef } from 'react';
import { EditIcon, PackageOpen, PencilLine, Trash2 } from 'lucide-react';

export type Product = {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  price: number;
};

type ProductRowProps = {
  item: Product;
  onEdit: (product: Product) => void;
  onPatch: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function ProductRow({ item, onEdit, onPatch, onDelete }: ProductRowProps) {
  return (
    <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
      <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-slate-400 sm:px-6">
        #{item.id}
      </td>
      <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
        {item.name}
      </td>
      <td className="px-4 py-4 sm:px-6">
        {item.category ? (
          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {item.category}
          </span>
        ) : (
          <span className="text-sm text-slate-400">Uncategorized</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.quantity > 10
              ? 'bg-emerald-50 text-emerald-700'
              : item.quantity > 0
                ? 'bg-amber-50 text-amber-700'
                : item.quantity === 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${
              item.quantity > 10
                ? 'bg-emerald-500'
                : item.quantity > 0
                  ? 'bg-amber-500'
                  : item.quantity === 0
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
            }`}
          />
          {item.quantity > 10
            ? `${item.quantity} in stock`
            : item.quantity > 0
              ? `Limited · ${item.quantity}`
              : item.quantity === 0
                ? 'Out of stock'
                : `${item.quantity} units`}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-medium tabular-nums text-slate-700 sm:px-6">
        ${item.price.toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right sm:px-6">
        <details className="group relative inline-block text-left">
          <summary
            aria-label={`Actions for ${item.name}`}
            className="cursor-pointer list-none rounded-md px-2.5 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden="true" className="font-bold tracking-widest">
              ···
            </span>
          </summary>
          <div className="absolute right-0 z-10 mt-1 min-w-40 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-lg shadow-slate-900/10">
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.closest('details')?.removeAttribute('open');
                onEdit(item);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <EditIcon size={15} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.closest('details')?.removeAttribute('open');
                onPatch(item);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <PencilLine size={15} aria-hidden="true" />
              Change price or quantity
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.closest('details')?.removeAttribute('open');
                onDelete(item);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </button>
          </div>
        </details>
      </td>
    </tr>
  );
}

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onPatch: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductsTable({
  products,
  onEdit,
  onPatch,
  onDelete,
}: ProductsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      tableContainerRef.current
        ?.querySelectorAll<HTMLDetailsElement>('details[open]')
        .forEach((details) => {
          if (!details.contains(target)) {
            details.removeAttribute('open');
          }
        });
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div ref={tableContainerRef} className="w-full overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-3.5 font-semibold sm:px-6"
            >
              ID
            </th>
            <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
              Product
            </th>
            <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
              Category
            </th>
            <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
              Stock
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 text-right font-semibold sm:px-6"
            >
              Price
            </th>
            <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <PackageOpen
                  size={30}
                  aria-hidden="true"
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-medium text-slate-700">
                  No products found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </td>
            </tr>
          ) : (
            products.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onPatch={onPatch}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}