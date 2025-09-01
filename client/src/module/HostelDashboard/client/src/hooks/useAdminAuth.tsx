import { useState, useEffect } from "react";

export interface AdminUser {
  adminId: number;
  name: string;
  email: string;
  mobile: string;
  adminType: string;
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      const parsed: AdminUser = JSON.parse(stored);
      // Backend verification for security
      fetch(`https://backend-hostel-module-production.up.railway.app/api/admin/exists?email=${encodeURIComponent(parsed.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.exists) {
            setAdmin(parsed);
          } else {
            setAdmin(null);
            localStorage.removeItem("adminUser");
          }
          setLoading(false);
        })
        .catch(() => {
          setAdmin(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return { admin, loading };
}