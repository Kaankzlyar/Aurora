// constants/config.ts
import { Platform } from "react-native";

const PORT = 5270;
const ANDROID_URL = `http://192.168.1.142:${PORT}`;
const IOS_URL = `http://localhost:${PORT}`;
const WEB_URL = `http://192.168.1.142:${PORT}`;

// Platform bazlı URL seçimi
export const BASE_URL = Platform.select({
  android: ANDROID_URL,
  ios: IOS_URL,
  web: WEB_URL,
  default: WEB_URL
}) || WEB_URL; // Fallback for undefined

// Debug için console log
console.log('[Config] ===== CONFIG LOADED =====');
console.log('[Config] Platform.OS:', Platform.OS);
console.log('[Config] ANDROID_URL:', ANDROID_URL);
console.log('[Config] IOS_URL:', IOS_URL);
console.log('[Config] WEB_URL:', WEB_URL);
console.log('[Config] Selected BASE_URL:', BASE_URL);
console.log('[Config] ============================');
