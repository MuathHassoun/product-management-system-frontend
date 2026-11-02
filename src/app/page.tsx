import ProductManager from '@/components/ProductManager';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section
        aria-label="Product inventory"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <ProductManager />
      </section>
    </main>
  );
}