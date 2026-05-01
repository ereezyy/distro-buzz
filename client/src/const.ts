export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// JWT Auth - Custom authentication (OAuth removed)
// Login and signup are handled via /login and /signup pages
// No OAuth integration - using custom JWT auth only
export const getLoginUrl = () => {
  return "/login";
};
