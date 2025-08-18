// constants/config.ts
import { Platform } from "react-native";
const PORT = 5270;
const ANDROID = `http://10.0.2.2:${PORT}`;
const IOS = `http://localhost:${PORT}`;
const LAN = `http://192.168.1.142:${PORT}`; // fiziksel cihaz için kendi IP’n
export const BASE_URL = Platform.select({ android: ANDROID, ios: IOS, default: LAN });
