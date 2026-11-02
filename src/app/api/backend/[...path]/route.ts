import { forwardProductApiRequest } from '@/lib/product-api';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forward(request: Request, { params }: RouteContext) {
  const { path } = await params;
  const requestUrl = new URL(request.url);
  const backendPath = path.map(encodeURIComponent).join('/');
  const search = requestUrl.search;
  const contentType = request.headers.get('content-type');

  return forwardProductApiRequest(`/api/${backendPath}${search}`, {
    method: request.method,
    headers: contentType ? { 'Content-Type': contentType } : undefined,
    body:
      request.method === 'POST' ||
      request.method === 'PUT' ||
      request.method === 'PATCH'
        ? await request.text()
        : undefined,
  });
}

export {
  forward as DELETE,
  forward as GET,
  forward as PATCH,
  forward as POST,
  forward as PUT,
};
