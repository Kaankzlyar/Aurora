import { BASE_URL } from "../constants/config";

export async function http<T>(
  path: string,
  opts: RequestInit = {},
  token?: string
): Promise<T> {
  const fullUrl = `${BASE_URL}${path}`;
  
  console.log('[HTTP] ===== API ÇAĞRISI BAŞLADI =====');
  console.log('[HTTP] URL:', fullUrl);
  console.log('[HTTP] Method:', opts.method || 'GET');
  console.log('[HTTP] Token:', token ? `${token.substring(0, 20)}...` : 'YOK');
  console.log('[HTTP] BASE_URL:', BASE_URL);

  const headers: Record<string,string> = {
    Accept: "application/json",
    ...(opts.headers as any),
  };
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json; charset=utf-8";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log('[HTTP] Headers:', headers);
  console.log('[HTTP] Body:', opts.body || 'YOK');

  try {
    const res = await fetch(fullUrl, { ...opts, headers });
    
    console.log('[HTTP] ===== YANIT ALINDI =====');
    console.log('[HTTP] Status:', res.status, res.statusText);
    console.log('[HTTP] Headers:', Object.fromEntries(res.headers.entries()));
    
    const ct = res.headers.get("content-type") || "";
    console.log('[HTTP] Content-Type:', ct);
    
    const read = async () =>
      ct.includes("application/json") ? res.json() : res.text();

    if (!res.ok) {
      console.log('[HTTP] ❌ HATA: Response not OK');
      const body = await read().catch((readError) => {
        console.log('[HTTP] Yanıt okuma hatası:', readError);
        return null;
      });
      
      console.log('[HTTP] Hata body:', body);
      
      const msg =
        (body && (body.message || body.error)) ||
        (typeof body === "string" ? body : `${res.status} ${res.statusText}`);
      
      console.log('[HTTP] Fırlatılacak hata mesajı:', msg);
      throw new Error(msg);
    }
    
    // 204
    if (res.status === 204) {
      console.log('[HTTP] ✅ 204 No Content - undefined döndürülüyor');
      return undefined as T;
    }
    
    const result = await read();
    console.log('[HTTP] ✅ Başarılı yanıt:', result);
    console.log('[HTTP] ==============================');
    return result as T;
  } catch (error: any) {
    console.error('[HTTP] ===== NETWORK HATASI =====');
    console.error('[HTTP] Hata tipi:', error?.name);
    console.error('[HTTP] Hata mesajı:', error?.message);
    console.error('[HTTP] Hata stack:', error?.stack);
    console.error('[HTTP] URL:', fullUrl);
    console.error('[HTTP] Token var mı:', token ? 'EVET' : 'HAYIR');
    console.error('[HTTP] =============================');
    throw error;
  }
}

export const imgUri = (imagePath?: string | null) =>
  imagePath ? `${BASE_URL}${imagePath}` : undefined;
