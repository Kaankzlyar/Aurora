// constants/config.ts
import { Platform } from "react-native";
const PORT = 5270;
const ANDROID = `http://192.168.1.142:${PORT}`; // Use LAN IP for Android
const IOS = `http://localhost:${PORT}`;
const LAN = `http://192.168.1.142:${PORT}`; // Use LAN IP for physical devices
export const BASE_URL = Platform.select({ android: ANDROID, ios: IOS, default: LAN });

// Debug için BASE_URL'yi console'a yazdır
console.log('[Config] Platform:', Platform.OS);
console.log('[Config] BASE_URL:', BASE_URL);
