const LOCAL_BACKEND_URL = "http://localhost:4000";
const DEPLOYED_BACKEND_URL = "https://feasto-backend-s58d.onrender.com";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const isLocalHost = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

export const backendUrl = (() => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configuredUrl) return trimTrailingSlash(configuredUrl);

  return isLocalHost() ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL;
})();
