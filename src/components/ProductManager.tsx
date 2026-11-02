'use client';

import { useCallback, useEffect, useState } from 'react';
import ProductFormDialog from '@/components/ProductFormDialog';
import ProductToolbar, {
  type ProductQuery,
  type ProductSort,
} from '@/components/ProductToolbar';
import ProductsTable, { type Product } from '@/components/ProductsTable';
import ProductPatchDialog from '@/components/ProductPatchDialog';

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;

  const product = value as Record<string, unknown>;
  return (
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    (typeof product.category === 'string' || product.category === null) &&
    typeof product.quantity === 'number' &&
    typeof product.price === 'number'
  );
}

async function getErrorMessage(response: Response): Promise<string> {
  const message = (await response.text()).trim();
  return message || `Request failed with status ${response.status}.`;
}

function getProductsPath(query: ProductQuery, sort: ProductSort): string {
  switch (query.type) {
    case 'all':
      return '/products';
    case 'id':
      return `/product/${encodeURIComponent(query.value)}`;
    case 'name':
      return `/product/name/${encodeURIComponent(query.value)}`;
    case 'category':
      return `/products/category/${encodeURIComponent(query.value)}`;
    case 'less':
      return `/products/less/${encodeURIComponent(query.value)}`;
    case 'greater':
      return `/products/greater/${encodeURIComponent(query.value)}`;
    case 'range': {
      const params = new URLSearchParams({
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
      });
      return `/products/range?${params.toString()}`;
    }
    case 'in-stock':
      return '/products/in-stock';
    case 'limited':
      return '/products/limited';
    case 'out-of-stock':
      return '/products/out-of-stock';
    case 'sort':
      return `/products/sort/${sort}`;
  }
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryValue, setInventoryValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProductQuery>({ type: 'all', value: '' });
  const [sort, setSort] = useState<ProductSort>('name-asc');
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [patchingProduct, setPatchingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadProducts = useCallback(async (nextQuery: ProductQuery, nextSort: ProductSort) => {
    const response = await fetch(
      `/api/backend${getProductsPath(nextQuery, nextSort)}`,
      { method: 'GET', cache: 'no-store' },
    );
    if (!response.ok) throw new Error(await getErrorMessage(response));

    const result: unknown = await response.json();
    if (Array.isArray(result)) {
      if (!result.every(isProduct)) {
        throw new Error('The product API returned data in an unexpected format.');
      }
      setProducts(result);
      return;
    }
    if (!isProduct(result)) {
      throw new Error('The product API returned data in an unexpected format.');
    }
    setProducts([result]);
  }, []);

  const loadInventoryValue = useCallback(async () => {
    const response = await fetch('/api/backend/products/inventory-value', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setInventoryValue(await response.text());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setLoading(true);

      try {
        await loadProducts({ type: 'all', value: '' }, 'name-asc');
      } catch (error) {
        setProducts([]);
        setLoadError(
          error instanceof Error ? error.message : 'Unable to load products.',
        );
      }

      try {
        await loadInventoryValue();
      } catch (error) {
        setInventoryValue(null);
        setActionError(
          error instanceof Error
            ? error.message
            : 'Unable to load inventory value.',
        );
      }

      if (active) {
        setLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      active = false;
    };
  }, [loadInventoryValue, loadProducts]);

  async function runQuery() {
    setLoading(true);
    setLoadError(null);
    setProducts([]);
    try {
      await loadProducts(query, sort);
    } catch (error) {
      setProducts([]);
      setLoadError(
        error instanceof Error ? error.message : 'Unable to load products.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshAfterMutation() {
    setActionError(null);
    setLoadError(null);
    setQuery({ type: 'all', value: '' });
    setLoading(true);
    const errors: string[] = [];

    try {
      await loadProducts({ type: 'all', value: '' }, sort);
    } catch (error) {
      setProducts([]);
      errors.push(
        error instanceof Error ? error.message : 'Unable to reload products.',
      );
    }
    try {
      await loadInventoryValue();
    } catch (error) {
      setInventoryValue(null);
      errors.push(
        error instanceof Error
          ? error.message
          : 'Unable to reload inventory value.',
      );
    }
    setActionError(errors.length > 0 ? errors.join(' ') : null);
    setLoading(false);
  }

  async function saveProduct(values: Omit<Product, 'id'>) {
    const isEditing = editingProduct !== null;
    const endpoint = isEditing
      ? `/api/backend/products/${editingProduct.id}`
      : '/api/backend/products';
    const response = await fetch(endpoint, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
    setFormOpen(false);
    await refreshAfterMutation();
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/backend/products/${product.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      await refreshAfterMutation();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete product.',
      );
    }
  }

  async function patchProduct(
    product: Product,
    values: { price?: string; quantity?: string },
  ) {
    const params = new URLSearchParams();
    if (values.price !== undefined) params.set('price', values.price);
    if (values.quantity !== undefined) params.set('quantity', values.quantity);
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    const response = await fetch(
      `/api/backend/products/${product.id}${suffix}`,
      { method: 'PATCH' },
    );
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setPatchingProduct(null);
    await refreshAfterMutation();
  }

  async function deleteCategory() {
    const category = categoryToDelete.trim();
    if (!category) return;
    if (!window.confirm(`Delete every product in "${category}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/backend/products/category/${encodeURIComponent(category)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setCategoryToDelete('');
      await refreshAfterMutation();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to delete products in this category.',
      );
    }
  }

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  return (
    <div>
      <ProductToolbar
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        onRunQuery={() => void runQuery()}
        loading={loading}
        resultCount={products.length}
        inventoryValue={inventoryValue}
        onAddProduct={openCreateForm}
        categoryToDelete={categoryToDelete}
        onCategoryToDeleteChange={setCategoryToDelete}
        onDeleteCategory={() => void deleteCategory()}
      />

      {loadError && (
        <p
          role="alert"
          className="mx-6 mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-8"
        >
          {loadError}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="mx-6 mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-8"
        >
          {actionError}
        </p>
      )}

      {loading ? (
        <div
          className="space-y-3 px-6 py-6 sm:px-8"
          aria-live="polite"
          aria-label="Loading products"
        >
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : !loadError ? (
        <div className="mt-0 border-t border-slate-200">
          <ProductsTable
            products={products}
            onEdit={openEditForm}
            onPatch={setPatchingProduct}
            onDelete={(product) => void deleteProduct(product)}
          />
        </div>
      ) : null}

      {formOpen && (
        <ProductFormDialog
          key={editingProduct?.id ?? 'new'}
          product={editingProduct}
          onClose={() => setFormOpen(false)}
          onSubmit={saveProduct}
        />
      )}
      {patchingProduct && (
        <ProductPatchDialog
          product={patchingProduct}
          onClose={() => setPatchingProduct(null)}
          onSubmit={(values) => patchProduct(patchingProduct, values)}
        />
      )}
    </div>
  );
}
