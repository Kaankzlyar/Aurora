// constants/config.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

const PORT = 5270;
const EXTRA_URL = (Constants.expoConfig as any)?.extra?.API_URL;
const FALLBACK_IP = '192.168.0.10';
const ANDROID_URL = `http://${FALLBACK_IP}:${PORT}`;
const IOS_URL = `http://localhost:${PORT}`;
const WEB_URL = `http://${FALLBACK_IP}:${PORT}`;

// Platform bazlı URL seçimi" 
export const BASE_URL = (EXTRA_URL as string) || Platform.select({
  android: ANDROID_URL,
  ios: IOS_URL,
  web: WEB_URL,
  default: WEB_URL
}) || WEB_URL; // Fallback for undefined

// Debug için console log
console.log('[Config] ===== CONFIG LOADED =====');
console.log('[Config] Platform.OS:', Platform.OS);
console.log('[Config] EXTRA_URL:', EXTRA_URL);
console.log('[Config] ANDROID_URL:', ANDROID_URL);
console.log('[Config] IOS_URL:', IOS_URL);
console.log('[Config] WEB_URL:', WEB_URL);
console.log('[Config] Selected BASE_URL:', BASE_URL);
console.log('[Config] ============================');
