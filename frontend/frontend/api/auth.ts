import Constants from "expo-constants";
import { Platform } from "react-native";

// Prefer configurable API URL via app.json -> expo.extra.API_URL
// Fallbacks:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical devices: set your machine IP in expo.extra.API_URL
const DEFAULT_BASE = Platform.select({
  android: "http://10.0.2.2:5270",
  ios: "https://localhost:7120",
  default: "http://10.0.2.2:5270",
});

const API_BASE = (Constants.expoConfig as any)?.extra?.API_URL || DEFAULT_BASE;
const BASE_URL = `${API_BASE}/api/auth`;

// Small helper to add a timeout to fetch (abort after N ms)
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 10000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Optionally keep a helper if needed later
// function toFormUrlEncoded(obj: Record<string, any>) {
//   const s = new URLSearchParams();
//   Object.entries(obj).forEach(([k, v]) => {
//     if (v !== undefined && v !== null) s.append(k, String(v));
//   });
//   return s.toString();
// }

// Kayıt ol
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  try {
    const trimmedFirst = firstName?.trim();
    const trimmedLast = lastName?.trim();
    const trimmedEmail = email?.trim()?.toLowerCase();
    
    console.log("[registerUser] Raw inputs - firstName:", JSON.stringify(firstName), "lastName:", JSON.stringify(lastName), "email:", JSON.stringify(email));
    console.log("[registerUser] Trimmed values - Name:", JSON.stringify(trimmedFirst), "LastName:", JSON.stringify(trimmedLast), "Email:", JSON.stringify(trimmedEmail));
    
    // Match your .NET UserDto exactly: Name, LastName, Email, Password
    const payload = {
      Name: trimmedFirst,
      LastName: trimmedLast,
      Email: trimmedEmail,
      Password: password,
    } as const;

    console.log("[registerUser] Sending to:", `${BASE_URL}/register`);
    console.log("[registerUser] Request payload:", JSON.stringify(payload, null, 2));
    console.log("[registerUser] Payload size:", JSON.stringify(payload).length, "bytes");

    const response = await fetchWithTimeout(`${BASE_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8", 
        "Accept": "application/json",
        "User-Agent": "Expo-Mobile-App"
      },
      body: JSON.stringify(payload),
      timeoutMs: 12000,
    });

    const contentType = response.headers.get("content-type") || "";
    let body: any = null;
    try {
      body = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch (e) {
      console.log("[registerUser] Failed to parse response body", e);
    }

    if (!response.ok) {
      console.log("[registerUser] HTTP Error:", response.status, response.statusText);
      console.log("[registerUser] Response headers:", Object.fromEntries(response.headers.entries()));
      console.log("[registerUser] Error body:", body);
      
      // Extract specific error message
      let errorMsg = "Registration failed";
      if (body) {
        if (typeof body === 'string') {
          errorMsg = body;
        } else if (body.message) {
          errorMsg = body.message;
        } else if (body.error) {
          errorMsg = body.error;
        } else if (body.errors) {
          // Handle validation errors
          errorMsg = JSON.stringify(body.errors);
        }
      }
      
      return { message: errorMsg };
    }

    console.log("[registerUser] Success", body);
    return body;
  } catch (error: any) {
    console.log("[registerUser] Network error", error?.message || error);
    const isAbort = error?.name === "AbortError";
    return { message: isAbort ? "İstek zaman aşımına uğradı." : "Kayıt sırasında ağ hatası oluştu." };
  }
};


// Giriş yap
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("[loginUser] URL:", `${BASE_URL}/login`);
    const response = await fetchWithTimeout(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      timeoutMs: 12000,
    });

    const contentType = response.headers.get("content-type") || "";
    let body: any = null;
    try {
      body = contentType.includes("application/json") ? await response.json() : await response.text();
    } catch (e) {
      console.log("[loginUser] Failed to parse response body", e);
    }

    if (!response.ok) {
      console.log("[loginUser] HTTP", response.status, body);
      return { message: (body && (body.message || body.error)) || `Sunucu hatası (${response.status})` };
    }

    console.log("[loginUser] Success", body);
    return body;
  } catch (error: any) {
    console.log("[loginUser] Network error", error?.message || error);
    const isAbort = error?.name === "AbortError";
    return { message: isAbort ? "İstek zaman aşımına uğradı." : "Giriş sırasında ağ hatası oluştu." };
  }
};
