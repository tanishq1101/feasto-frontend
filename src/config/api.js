const DEFAULT_BACKEND_URL = "http://localhost:4000";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const backendUrl = (() => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  const resolvedUrl = configuredUrl || DEFAULT_BACKEND_URL;
  return trimTrailingSlash(resolvedUrl);
})();
