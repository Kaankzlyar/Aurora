import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect if running on emulator vs physical device
const isEmulator = Platform.select({
  android: Constants.platform?.android?.isDevice === false,
  ios: Constants.platform?.ios?.isDevice === false,
  default: false,
});

// Prefer configurable API URL via app.json -> expo.extra.API_URL
// Fallbacks:
// - Android Emulator: 10.0.2.2
// - iOS Simulator: localhost
// - Physical devices: use your machine's IP from expo.extra.API_URL
const DEFAULT_BASE = Platform.select({
  android: isEmulator ? "http://10.0.2.2:5270" : (Constants.expoConfig as any)?.extra?.API_URL,
  ios: isEmulator ? "http://localhost:5270" : (Constants.expoConfig as any)?.extra?.API_URL,
  default: (Constants.expoConfig as any)?.extra?.API_URL,
});

const API_BASE = (Constants.expoConfig as any)?.extra?.API_URL || DEFAULT_BASE;
const BASE_URL = `${API_BASE}/api/auth`;

console.log("[auth.ts] ===== API CONFIGURATION =====");
console.log("[auth.ts] Platform:", Platform.OS);
console.log("[auth.ts] Is Emulator:", isEmulator);
console.log("[auth.ts] Device Info:", Constants.platform);
console.log("[auth.ts] Default Base URL:", DEFAULT_BASE);
console.log("[auth.ts] Configured API_URL:", (Constants.expoConfig as any)?.extra?.API_URL);
console.log("[auth.ts] Final API_BASE:", API_BASE);
console.log("[auth.ts] Final BASE_URL:", BASE_URL);
console.log("[auth.ts] =====================================");

// Small helper to add a timeout to fetch (abort after N ms)
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 15000, ...rest } = init; // Increased default timeout
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
    console.log("  - Timeout: 20000ms");
    
    const response = await fetchWithTimeout(`${BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        "User-Agent": "Expo-Mobile-App"
      },
      body: JSON.stringify(payload),
      timeoutMs: 20000, // Increased from 12000 to 20000
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
    console.log("[loginUser] Trying to connect to:", `${BASE_URL}/login`);
    
    const isAbort = error?.name === "AbortError";
    let errorMessage;
    
    if (isAbort) {
      errorMessage = "Server bağlantısı zaman aşımına uğradı. Server çalışıyor mu kontrol edin.";
    } else if (error?.message?.includes('Network request failed')) {
      errorMessage = "Network bağlantısı başarısız. Server adresini kontrol edin.";
    } else {
      errorMessage = "Giriş sırasında ağ hatası oluştu: " + (error?.message || 'Bilinmeyen hata');
    }
    
    return { message: errorMessage };
  }
};

// Test server connectivity
export const testServerConnection = async () => {
  try {
    console.log("[testServerConnection] Testing connection to:", API_BASE);
    const response = await fetchWithTimeout(API_BASE, {
      method: "GET",
      timeoutMs: 5000,
    });
    console.log("[testServerConnection] Server responded with status:", response.status);
    return { success: true, status: response.status };
  } catch (error: any) {
    console.log("[testServerConnection] Connection failed:", error?.message);
    return { success: false, error: error?.message };
  }
};

// Get user profile information
export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { message: "No authentication token found" };
    }

    console.log("[getUserProfile] Fetching user profile...");
    
    const response = await fetchWithTimeout(`${BASE_URL}/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      timeoutMs: 10000,
    });

    console.log("[getUserProfile] Response status:", response.status);

    const contentType = response.headers.get("content-type") || "";
    let body: any = null;
    
    try {
      body = contentType.includes("application/json") 
        ? await response.json() 
        : await response.text();
    } catch (e) {
      console.log("[getUserProfile] Failed to parse response body", e);
    }

    if (!response.ok) {
      console.log("[getUserProfile] Profile fetch failed:", body);
             // If profile endpoint doesn't exist, fallback to token data
       if (response.status === 404) {
         console.log("[getUserProfile] Profile endpoint not found, using token data");
         const tokenData = await getUserInfoFromToken(token);
         return tokenData ? { success: true, user: tokenData } : { message: "Failed to get user info" };
       }
      return { message: body?.message || "Failed to fetch profile" };
    }

    console.log("[getUserProfile] Profile fetched successfully:", body);
    return { success: true, user: body };
  } catch (error: any) {
    console.log("[getUserProfile] Network error:", error?.message);
         // Fallback to token data on network error
     try {
       const token = await AsyncStorage.getItem('userToken');
       if (token) {
         const tokenData = await getUserInfoFromToken(token);
         return tokenData ? { success: true, user: tokenData } : { message: "Network error and no token data" };
       }
     } catch (e) {
       console.log("[getUserProfile] Token fallback failed:", e);
     }
    return { message: "Network error occurred" };
  }
};

// Şifremi unuttum
export const forgotPassword = async (email: string) => {
  try {
    const trimmedEmail = email?.trim()?.toLowerCase();
    
    console.log("[forgotPassword] ===== PASSWORD RESET REQUEST =====");
    console.log("[forgotPassword] Email:", JSON.stringify(trimmedEmail));
    
    // Validate email
    if (!trimmedEmail || trimmedEmail.length === 0) {
      throw new Error("E-posta adresi boş olamaz");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error("Geçersiz e-posta formatı");
    }
    
    const payload = {
      email: trimmedEmail,
    };

    console.log("[forgotPassword] Sending to:", `${BASE_URL}/forgot-password`);
    console.log("[forgotPassword] Request payload:", JSON.stringify(payload));
    
    const response = await fetchWithTimeout(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        "User-Agent": "Expo-Mobile-App"
      },
      body: JSON.stringify(payload),
      timeoutMs: 15000,
    });

    console.log("[forgotPassword] Response status:", response.status, response.statusText);

    const contentType = response.headers.get("content-type") || "";
    let body: any = null;
    
    try {
      const responseText = await response.text();
      if (responseText.trim().length > 0) {
        body = contentType.includes("application/json") 
          ? JSON.parse(responseText) 
          : { message: responseText };
      }
    } catch (parseError) {
      console.log("[forgotPassword] Response parse error:", parseError);
    }

    if (!response.ok) {
      console.log("[forgotPassword] ===== PASSWORD RESET FAILED =====");
      console.log("[forgotPassword] Error body:", body);
      
      let errorMsg = "Şifre sıfırlama talebi başarısız";
      if (body?.message) {
        errorMsg = body.message;
      } else if (typeof body === 'string') {
        errorMsg = body;
      }
      
      throw new Error(errorMsg);
    }

    console.log("[forgotPassword] ===== PASSWORD RESET SUCCESS =====");
    console.log("[forgotPassword] Success body:", body);
    
    return body || { message: "Şifre sıfırlama bağlantısı gönderildi" };
  } catch (error: any) {
    console.log("[forgotPassword] ===== ERROR =====");
    console.log("[forgotPassword] Error:", error?.message || error);
    
    if (error?.name === "AbortError") {
      throw new Error("İstek zaman aşımına uğradı");
    } else if (error?.message?.includes('Network request failed')) {
      throw new Error("Ağ bağlantısı başarısız");
    } else {
      throw error;
    }
  }
};

// Extract user information from JWT token
export const getUserInfoFromToken = async (token: string) => {
  try {
    if (!token) {
      console.log("[getUserInfoFromToken] No token provided");
      return null;
    }

    // Split JWT token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("[getUserInfoFromToken] Invalid JWT format");
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    try {
      const decodedPayload = atob(paddedPayload);
      const userData = JSON.parse(decodedPayload);
      
      console.log("[getUserInfoFromToken] Decoded user data:", userData);
      
      // Extract common JWT claims
      const userInfo = {
        id: userData.sub || userData.id || userData.userId || userData.nameid,
        email: userData.email || userData.Email,
        name: userData.name || userData.Name || userData.given_name || userData.unique_name,
        firstName: userData.firstName || userData.FirstName || userData.name || userData.Name || userData.given_name || userData.unique_name,
        lastName: userData.lastName || userData.LastName || userData.family_name,
        fullName: userData.fullName || userData.FullName || userData.unique_name,
        username: userData.username || userData.Username || userData.email || userData.Email || userData.unique_name,
        exp: userData.exp, // Expiration time
        iat: userData.iat, // Issued at time
        nbf: userData.nbf, // Not before time
      };
      
      // Special handling for .NET backend field names
      if (userData.unique_name && !userInfo.fullName) {
        userInfo.fullName = userData.unique_name;
        userInfo.name = userData.unique_name;
        userInfo.firstName = userData.unique_name;
      }
      
      // Add a small delay to ensure proper async handling
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return userInfo;
    } catch (decodeError) {
      console.log("[getUserInfoFromToken] Failed to decode JWT payload:", decodeError);
      return null;
    }
  } catch (error: any) {
    console.log("[getUserInfoFromToken] Error extracting user info:", error?.message);
    return null;
  }
};
