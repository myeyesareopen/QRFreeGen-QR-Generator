interface Env {
  QR_KV: KVNamespace;
  QR_BUCKET: R2Bucket;
}

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 7;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const id = url.searchParams.get('id') || url.searchParams.get('share');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const metadataStr = await env.QR_KV.get(id);
    if (!metadataStr) {
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const metadata = JSON.parse(metadataStr);
    if (!metadata.dataUrl || !metadata.svgString) {
      return new Response(JSON.stringify({ error: 'Incomplete share data' }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      id,
      text: metadata.text,
      dataUrl: metadata.dataUrl,
      svgString: metadata.svgString,
      url: `${url.origin}/s/${id}`,
      created: metadata.created,
      expiresAt: metadata.created ? metadata.created + (SHARE_TTL_SECONDS * 1000) : null
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json() as any;
    const { text, dataUrl, svgString } = body;

    if (!dataUrl || !svgString) {
      return new Response("Missing data", { status: 400 });
    }

    // Generate a random ID (simple alphanumeric)
    const id = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);

    // Extract base64 data
    const base64Data = dataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 1. Upload Image to R2
    const pngKey = `qrcode/${id}.png`;
    await env.QR_BUCKET.put(pngKey, bytes.buffer, {
      httpMetadata: { contentType: 'image/png' }
    });

    // 2. Save Metadata to KV
    await env.QR_KV.put(id, JSON.stringify({ 
      text: text || '',
      created: Date.now(),
      png: pngKey,
      dataUrl,
      svgString
    }), {
      expirationTtl: SHARE_TTL_SECONDS
    });

    // 3. Return the share URL pointing to homepage with query param
    const shareUrl = `${url.origin}/s/${id}`;
    
    return new Response(JSON.stringify({ id, url: shareUrl, expiresIn: SHARE_TTL_SECONDS }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
