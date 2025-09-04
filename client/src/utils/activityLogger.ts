export type ActivityLogPayload = {
  userId: string;
  userEmail: string;
  userType: string;
  actionType: string; // "VISIT" | "CLICK" | "ERROR"
  pageUrl: string;
  actionDescription?: string;
};

export async function logUserActivity(payload: ActivityLogPayload) {
  try {
    await fetch("https://your-backend-domain/api/activity-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}
}
