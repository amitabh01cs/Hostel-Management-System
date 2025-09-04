import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logUserActivity } from "../utils/activityLogger";

export function usePageLogger(user: {
  userId: string;
  userEmail: string;
  userType: string;
}) {
  const location = useLocation();

  useEffect(() => {
    if (!user?.userId) return;
    logUserActivity({
      userId: user.userId,
      userEmail: user.userEmail,
      userType: user.userType,
      actionType: "VISIT",
      pageUrl: location.pathname,
      actionDescription: "Visited " + location.pathname,
    });
  }, [location.pathname, user]);
}
