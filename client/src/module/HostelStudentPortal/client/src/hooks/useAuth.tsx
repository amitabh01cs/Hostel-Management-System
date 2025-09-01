import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("studentUser");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  return { user, loading };
}