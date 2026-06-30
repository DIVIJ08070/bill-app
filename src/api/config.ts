import Constants from 'expo-constants';

// The FastAPI backend port (uvicorn ... --port 8000).
const API_PORT = 8000;

/**
 * Work out the backend host automatically.
 *
 * When running in Expo Go on a real phone, the app is served by Metro from your
 * computer's LAN IP (e.g. 192.168.1.5). We reuse that same IP for the API so it
 * "just works" on the same Wi-Fi — no manual editing needed.
 *
 * If auto-detection fails, set API_BASE_URL_OVERRIDE below to e.g.
 *   'http://192.168.1.5:8000/api'
 */
const API_BASE_URL_OVERRIDE: string | null = null;

function detectHost(): string {
  const c = Constants as any;
  const hostUri =
    c.expoConfig?.hostUri ||
    c.expoGoConfig?.debuggerHost || // older Expo Go field
    c.manifest?.debuggerHost || // legacy manifest field
    '';
  const host = String(hostUri).split(':')[0];
  return host || 'localhost';
}

export const API_BASE_URL =
  API_BASE_URL_OVERRIDE ?? `http://${detectHost()}:${API_PORT}/api`;
