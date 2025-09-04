import { useLocation } from "wouter"; // 👈 THIS IS THE FIX!
import { useEffect } from "react";
import { logUserActivity } from "../utils/activityLogger";

export function usePageLogger(user: {
  userId: string;
  userEmail: string;
  userType: string;
}) {
  const [location] = useLocation(); // 👈 Wouter returns [location, setLocation]

  useEffect(() => {
    if (!user?.userId) return;
    logUserActivity({
      userId: user.userId,
      userEmail: user.userEmail,
      userType: user.userType,
      actionType: "VISIT",
      pageUrl: location,
      actionDescription: "Visited " + location,
    });
  }, [location, user]);
}
