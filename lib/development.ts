export function isDevelopmentAuthBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

export function isLocalDemoMode() {
  return isDevelopmentAuthBypassEnabled();
}
