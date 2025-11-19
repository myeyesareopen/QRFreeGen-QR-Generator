// Define global types for Cloudflare Pages environment
interface KVNamespace {
  get(key: string, options?: { type?: "text" | "json" | "arrayBuffer" | "stream"; cacheTtl?: number }): Promise<string | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: { expiration?: number; expirationTtl?: number; metadata?: any }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

interface R2Bucket {
  get(key: string, options?: any): Promise<R2ObjectBody | null>;
  put(key: string, value: any, options?: any): Promise<R2Object>;
  delete(key: string): Promise<void>;
}

interface R2Object {
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface Env {
  QR_KV: KVNamespace;
  QR_BUCKET: R2Bucket;
}