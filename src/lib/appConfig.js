import { resolveAppConfig } from "@/domain/auth/appConfig.js";

export const appConfig = resolveAppConfig(
  globalThis.NEXTFLUX_CONFIG,
  import.meta.env,
);
