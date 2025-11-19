interface Env {
  QR_KV: KVNamespace;
  QR_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const id = params.id as string;

  if (!id) return new Response("Not Found", { status: 404 });

  // Check KV to see if it exists and get the key
  const metadataStr = await env.QR_KV.get(id);
  if (!metadataStr) {
     // Fallback: check if user is just requesting the image directly by ID (legacy or direct link)
     // But we stick to KV check for validity
     return new Response("QR Code Not Found", { status: 404 });
  }

  const metadata = JSON.parse(metadataStr);
  const objectKey = metadata.png;

  // Get from R2
  const object = await env.QR_BUCKET.get(objectKey);

  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  // Cache for 1 hour in browser
  headers.set('Cache-Control', 'public, max-age=3600');

  return new Response(object.body, {
    headers,
  });
}