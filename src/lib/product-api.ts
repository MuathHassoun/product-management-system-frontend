const productApiBaseUrl =
  process.env.PRODUCT_API_BASE_URL ?? 'http://localhost:8080';

export function forwardProductApiRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(new URL(path, productApiBaseUrl), {
    ...init,
    cache: 'no-store',
  });
}
