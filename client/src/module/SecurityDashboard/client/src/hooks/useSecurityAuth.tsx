import { useEffect, useState } from "react";

/**
 * Checks if a security user is logged in (from localStorage).
 * Redirects to /login if not authenticated.
 */
export function useSecurityAuth() {
  const [security, setSecurity] = useState<null | {
    securityId: number;
    name: string;
    email: string;
    mobile: string;
    username: string;
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const securityUserStr = localStorage.getItem("securityUser");
    if (securityUserStr) {
      try {
        setSecurity(JSON.parse(securityUserStr));
      } catch {
        setSecurity(null);
      }
    } else {
      setSecurity(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !security) {
      window.location.href = "/login";
    }
  }, [loading, security]);

  return { security, loading };
}