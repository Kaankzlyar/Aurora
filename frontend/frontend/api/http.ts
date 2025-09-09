import { BASE_URL } from "../constants/config";

type HttpOpts = RequestInit & {
  /** İsteğe özel timeout (ms). Varsayılan: 15000 */
  timeoutMs?: number;
};

export async function http<T>(
  path: string,
  opts: HttpOpts = {},
  token?: string
): Promise<T> {
  // BASE_URL guard
  if (!BASE_URL || BASE_URL === "undefined") {
    console.error("[HTTP] FATAL: BASE_URL is undefined or null!");
    throw new Error("BASE_URL is not configured properly");
  }

  const fullUrl = `${BASE_URL}${path}`;
  const {
    timeoutMs = 15000,
    signal: externalSignal,
    headers: incomingHeaders,
    ...rest
  } = opts;

  // Her çağrı için taze controller (dışardan signal verilmişse onu kullan)
  const internalController = new AbortController();
  const signal = externalSignal ?? internalController.signal;

  // Timeout kur
  const timer = setTimeout(() => {
    // Yalnızca kendi controller'ımız varsa abort et
    if (!externalSignal) internalController.abort();
  }, timeoutMs);

  // Header’ları topla
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(incomingHeaders as any),
  };
  if (rest.body && !(rest.body instanceof FormData)) {
    headers["Content-Type"] =
      headers["Content-Type"] ?? "application/json; charset=utf-8";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Loglar
  console.log("[HTTP] ===== API ÇAĞRISI BAŞLADI =====");
  console.log("[HTTP] Raw BASE_URL value:", BASE_URL);
  console.log("[HTTP] Path:", path);
  console.log("[HTTP] Full URL:", fullUrl);
  console.log("[HTTP] Method:", rest.method || "GET");
  console.log("[HTTP] Token:", token ? `${token.substring(0, 20)}...` : "YOK");
  console.log("[HTTP] Timeout(ms):", timeoutMs);
  console.log("[HTTP] Headers:", headers);
  console.log("[HTTP] Body:", (rest as any).body || "YOK");

  try {
    const res = await fetch(fullUrl, { ...rest, headers, signal });

    console.log("[HTTP] ===== YANIT ALINDI =====");
    console.log("[HTTP] Status:", res.status, res.statusText);
    console.log("[HTTP] Headers:", Object.fromEntries(res.headers.entries()));

    const ct = res.headers.get("content-type") || "";
    console.log("[HTTP] Content-Type:", ct);

    const read = async () =>
      ct.includes("application/json") ? res.json() : res.text();

    if (!res.ok) {
      console.log("[HTTP] ❌ HATA: Response not OK");
      const body = await read().catch((readError) => {
        console.log("[HTTP] Yanıt okuma hatası:", readError);
        return null;
      });

      console.log("[HTTP] Hata body:", body);

      const msg =
        (body && (body.message || (body as any).error)) ||
        (typeof body === "string" ? body : `${res.status} ${res.statusText}`);

      console.log("[HTTP] Fırlatılacak hata mesajı:", msg);
      throw new Error(msg);
    }

    if (res.status === 204) {
      console.log("[HTTP] ✅ 204 No Content - undefined döndürülüyor");
      return undefined as T;
    }

    const result = (await read()) as T;
    console.log("[HTTP] ✅ Başarılı yanıt:", result);
    console.log("[HTTP] ==============================");
    return result;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.warn("[HTTP] ⏹️ AbortError: İstek iptal edildi (timeout/unmount/manual).");
      // İstersen burada özel bir hata tipine wrap edebilirsin
      throw error;
    }
    console.error("[HTTP] ===== NETWORK HATASI =====");
    console.error("[HTTP] Hata tipi:", error?.name);
    console.error("[HTTP] Hata mesajı:", error?.message);
    console.error("[HTTP] Hata stack:", error?.stack);
    console.error("[HTTP] URL:", fullUrl);
    console.error("[HTTP] Token var mı:", token ? "EVET" : "HAYIR");
    console.error("[HTTP] =============================");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Görsel URL yardımcı fonksiyonu
export const imgUri = (imagePath?: string | null) => {
  if (!imagePath) return undefined;

  let cleanPath = imagePath;
  if (cleanPath.startsWith("/wwwroot")) {
    cleanPath = cleanPath.replace("/wwwroot", "");
  }

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  const fullUrl = `${BASE_URL}${normalizedPath}`;
  console.log(
    `[imgUri] Input: ${imagePath} -> Cleaned: ${cleanPath} -> Normalized: ${normalizedPath} -> Final: ${fullUrl}`
  );

  return fullUrl;
};
