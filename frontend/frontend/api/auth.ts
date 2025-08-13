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
    
    console.log("[registerUser] ===== REGISTRATION ATTEMPT DETAILS =====");
    console.log("[registerUser] Raw inputs - firstName:", JSON.stringify(firstName), "lastName:", JSON.stringify(lastName), "email:", JSON.stringify(email));
    console.log("[registerUser] Trimmed values - Name:", JSON.stringify(trimmedFirst), "LastName:", JSON.stringify(trimmedLast), "Email:", JSON.stringify(trimmedEmail));
    
    // Validate inputs
    if (!trimmedFirst || trimmedFirst.length === 0) {
      return { message: "İsim boş olamaz" };
    }
    if (!trimmedLast || trimmedLast.length === 0) {
      return { message: "Soyisim boş olamaz" };
    }
    if (!trimmedEmail || trimmedEmail.length === 0) {
      return { message: "E-posta adresi boş olamaz" };
    }
    if (!password || password.length === 0) {
      return { message: "Şifre boş olamaz" };
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { message: "Geçersiz e-posta formatı" };
    }
    
    // Match your .NET UserDto exactly: Name, LastName, Email, Password
    const payload = {
      Name: trimmedFirst,
      LastName: trimmedLast,
      Email: trimmedEmail,
      Password: password,
    } as const;

    console.log("[registerUser] Sending to:", `${BASE_URL}/register`);
    console.log("[registerUser] Request payload:", JSON.stringify({
      Name: trimmedFirst,
      LastName: trimmedLast,
      Email: trimmedEmail,
      Password: "***" + password.slice(-2)
    }, null, 2));
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

    console.log("[registerUser] Response status:", response.status, response.statusText);
    console.log("[registerUser] Response headers:", Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get("content-type") || "";
    let body: any = null;
    try {
      body = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch (e) {
      console.log("[registerUser] Failed to parse response body", e);
    }

    console.log("[registerUser] Response body:", body);

    if (!response.ok) {
      console.log("[registerUser] ===== REGISTRATION FAILED =====");
      console.log("[registerUser] HTTP Error:", response.status, response.statusText);
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

    console.log("[registerUser] ===== REGISTRATION SUCCESS =====");
    console.log("[registerUser] Success response:", body);
    
    // Check if the response actually indicates success
    if (body) {
      if (body.token) {
        console.log("[registerUser] ✅ Token received - registration confirmed");
      } else if (body.success === true) {
        console.log("[registerUser] ✅ Success flag confirmed");
      } else if (body.id || body.userId) {
        console.log("[registerUser] ✅ User ID received - registration confirmed");
      } else {
        console.log("[registerUser] ⚠️ WARNING: No clear success indicator in response");
        console.log("[registerUser] Response keys:", Object.keys(body));
      }
    } else {
      console.log("[registerUser] ⚠️ WARNING: Empty response body but status was OK");
    }
    
    return body;
  } catch (error: any) {
    console.log("[registerUser] ===== NETWORK ERROR =====");
    console.log("[registerUser] Error details:", error?.message || error);
    console.log("[registerUser] Error name:", error?.name);
    console.log("[registerUser] Error stack:", error?.stack);
    
    const isAbort = error?.name === "AbortError";
    return { message: isAbort ? "İstek zaman aşımına uğradı." : "Kayıt sırasında ağ hatası oluştu." };
  }
};


// Giriş yap
export const loginUser = async (email: string, password: string) => {
  try {
    const trimmedEmail = email?.trim()?.toLowerCase();
    
    console.log("[loginUser] ===== LOGIN ATTEMPT DETAILS =====");
    console.log("[loginUser] Raw email input:", JSON.stringify(email));
    console.log("[loginUser] Raw email length:", email?.length || 0);
    console.log("[loginUser] Raw email char codes:", email ? Array.from(email).map(c => c.charCodeAt(0)).join(',') : 'none');
    console.log("[loginUser] Trimmed email:", JSON.stringify(trimmedEmail));
    console.log("[loginUser] Trimmed email length:", trimmedEmail?.length || 0);
    console.log("[loginUser] Trimmed email char codes:", trimmedEmail ? Array.from(trimmedEmail).map(c => c.charCodeAt(0)).join(',') : 'none');
    console.log("[loginUser] Password provided:", password ? "YES" : "NO");
    console.log("[loginUser] Password length:", password?.length || 0);
    
    // Validate inputs
    if (!trimmedEmail || trimmedEmail.length === 0) {
      return { message: "E-posta adresi boş olamaz" };
    }
    if (!password || password.length === 0) {
      return { message: "Şifre boş olamaz" };
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { message: "Geçersiz e-posta formatı" };
    }
    
    const payload = {
      email: trimmedEmail,   // Try lowercase first since debug shows this might be the issue
      password: password,
    };

    console.log("[loginUser] URL:", `${BASE_URL}/login`);
    console.log("[loginUser] Request payload:", JSON.stringify({ 
      email: trimmedEmail, 
      password: "***" + password.slice(-2) // Show last 2 chars for debugging
    }));
    console.log("[loginUser] Full request details:");
    console.log("  - Method: POST");
    console.log("  - Content-Type: application/json; charset=utf-8");
    console.log("  - Body size:", JSON.stringify(payload).length, "bytes");
    
    const response = await fetchWithTimeout(`${BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        "User-Agent": "Expo-Mobile-App"
      },
      body: JSON.stringify(payload),
      timeoutMs: 12000,
    });

    console.log("[loginUser] Response status:", response.status, response.statusText);
    console.log("[loginUser] Response headers:", Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get("content-type") || "";
    console.log("[loginUser] Content-Type:", contentType);
    
    let body: any = null;
    try {
      const responseText = await response.text();
      console.log("[loginUser] Raw response text:", JSON.stringify(responseText));
      console.log("[loginUser] Response text length:", responseText.length);
      
      if (responseText.trim().length === 0) {
        console.log("[loginUser] ❌ Empty response from server");
        return { message: "Empty response from server" };
      }
      
      if (contentType.includes("application/json")) {
        body = JSON.parse(responseText);
        console.log("[loginUser] Parsed JSON successfully:", body);
      } else {
        console.log("[loginUser] Non-JSON response:", responseText);
        body = { message: responseText };
      }
    } catch (parseError: any) {
      console.log("[loginUser] Response parse error:", parseError.message);
      return { message: "Response parse error: " + parseError.message };
    }

    if (!response.ok) {
      console.log("[loginUser] ===== LOGIN FAILED =====");
      console.log("[loginUser] Error body:", body);
      
      // Extract specific error message
      let errorMsg = "Login failed";
      if (body) {
        if (typeof body === 'string') {
          errorMsg = body;
        } else if (body.message) {
          errorMsg = body.message;
        } else if (body.error) {
          errorMsg = body.error;
        }
      }
      
      return { message: errorMsg };
    }

    console.log("[loginUser] ===== LOGIN SUCCESS =====");
    console.log("[loginUser] Success body:", body);
    console.log("[loginUser] Token received:", body?.token ? "YES" : "NO");
    console.log("[loginUser] Token length:", body?.token?.length || 0);
    return body;
  } catch (error: any) {
    console.log("[loginUser] ===== NETWORK ERROR =====");
    console.log("[loginUser] Error details:", error?.message || error);
    console.log("[loginUser] Error name:", error?.name);
    console.log("[loginUser] Error stack:", error?.stack);
    
    const isAbort = error?.name === "AbortError";
    return { message: isAbort ? "İstek zaman aşımına uğradı." : "Giriş sırasında ağ hatası oluştu." };
  }
};
