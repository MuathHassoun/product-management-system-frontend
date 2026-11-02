'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
          <span aria-hidden="true" className="text-xl font-semibold">!</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p role="alert" className="mt-2 text-sm leading-6 text-slate-600">
          Unable to load products. Make sure the product API is available, then
          try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
