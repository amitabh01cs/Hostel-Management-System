import { useState, useEffect } from "react";

export function useStudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("studentEmail");
    if (!email) {
      window.location.href = "https://hostel-management-system-cvny.vercel.app/";
      return;
    }

    fetch(`https://backend-hostel-module-production-iist.up.railway.app/api/student/me?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          window.location.href = "https://hostel-management-system-cvny.vercel.app/";
        } else {
          setStudent(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        window.location.href = "https://hostel-management-system-cvny.vercel.app/";
      });
  }, []);

  return { student, loading };
}