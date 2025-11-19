interface Env {
  QR_KV: KVNamespace;
  QR_BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as any;
    const { text, dataUrl } = body;

    if (!text || !dataUrl) {
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
    const pngKey = `${id}.png`;
    await env.QR_BUCKET.put(pngKey, bytes.buffer, {
      httpMetadata: { contentType: 'image/png' }
    });

    // 2. Save Metadata to KV
    // We store the text and reference to the image.
    await env.QR_KV.put(id, JSON.stringify({ 
      text, 
      created: Date.now(),
      png: pngKey
    }));

    // 3. Return the public sharing URL
    // We assume the current host serves /s/[id] which proxies to R2
    const url = new URL(request.url);
    const shareUrl = `${url.origin}/s/${id}`;
    
    return new Response(JSON.stringify({ id, url: shareUrl }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
