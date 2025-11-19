interface Env {
  QR_KV: KVNamespace;
  QR_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const id = params.id as string;

  if (!id) return new Response("Not Found", { status: 404 });

  const accept = request.headers.get('accept') || '';
  const url = new URL(request.url);

  const metadataStr = await env.QR_KV.get(id);
  if (!metadataStr) {
    return new Response("QR Code Not Found", { status: 404 });
  }

  // If the browser expects HTML, redirect to homepage with ?share
  if (!accept || accept.includes('text/html')) {
    url.pathname = '/';
    url.searchParams.set('share', id);
    return Response.redirect(url.toString(), 302);
  }

  const metadata = JSON.parse(metadataStr);
  const objectKey = metadata.png;

  // Get from R2 for image consumers (legacy or direct image usage)
  const object = await env.QR_BUCKET.get(objectKey);

  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=3600');

  return new Response(object.body, {
    headers,
  });
}
