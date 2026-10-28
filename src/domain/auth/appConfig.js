import { normalizeServerUrl } from "../../lib/url.js";

// Deployment defaults for the login page. `public/config.js` sets
// `window.NEXTFLUX_CONFIG` and can be replaced at runtime (for example a
// ConfigMap mounted over /srv/config.js); build-time VITE_* variables are the
// fallback.
export function resolveAppConfig(runtime, env = {}) {
  const config = runtime && typeof runtime === "object" ? runtime : {};
  const authType = config.authType ?? env.VITE_DEFAULT_AUTH_TYPE ?? "";
  return {
    serverUrl: normalizeServerUrl(
      config.serverUrl ?? env.VITE_DEFAULT_SERVER_URL ?? "",
    ),
    authType: ["basic", "token"].includes(authType) ? authType : "",
    lockServerUrl: Boolean(
      config.lockServerUrl ?? env.VITE_LOCK_SERVER_URL === "true",
    ),
  };
}
