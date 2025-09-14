import axios from "axios";

export interface UserActivityPayload {
  userId: string;
  actionType: string;
  pageUrl: string;
  actionDescription: string;
  timestamp?: string;
}

export const logUserActivity = async (activity: UserActivityPayload) => {
  try {
    await axios.post("https://hostel-backend-module-production-iist.up.railway.app/api/track", {
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log user activity", error);
  }
};
