import test from "node:test";
import assert from "node:assert/strict";
import { resolveAppConfig } from "../../src/domain/auth/appConfig.js";

test("runtime config wins over build-time defaults and is normalized", () => {
  assert.deepEqual(
    resolveAppConfig(
      { serverUrl: "https://rss.example/v1/", authType: "token" },
      { VITE_DEFAULT_SERVER_URL: "https://other.example" },
    ),
    {
      serverUrl: "https://rss.example",
      authType: "token",
      lockServerUrl: false,
    },
  );
});

test("build-time defaults apply when the runtime config is empty or invalid", () => {
  const env = {
    VITE_DEFAULT_SERVER_URL: "https://rss.example/",
    VITE_DEFAULT_AUTH_TYPE: "token",
    VITE_LOCK_SERVER_URL: "true",
  };
  assert.deepEqual(resolveAppConfig(undefined, env), {
    serverUrl: "https://rss.example",
    authType: "token",
    lockServerUrl: true,
  });
  assert.deepEqual(resolveAppConfig("junk", {}), {
    serverUrl: "",
    authType: "",
    lockServerUrl: false,
  });
  assert.equal(resolveAppConfig({ authType: "magic" }).authType, "");
});
