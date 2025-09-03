const API_BASE_URL = "https://hostel-backend-module-production-iist.up.railway.app";

export const logActivity = (action, data = {}) => {
  try {
    const userString = localStorage.getItem("user") || localStorage.getItem("adminUser");
    if (!userString) {
      // User is not logged in, so we can't log the activity.
      return;
    }
    
    const userData = JSON.parse(userString);

    const logPayload = {
      userId: String(userData.id || userData.userId), // Handle both user and admin user objects
      userEmail: userData.email,
      userType: userData.role || userData.adminType || "Unknown",
      action: action, // e.g., 'PAGE_VIEW', 'LOGOUT'
      pageUrl: window.location.pathname, // The current page URL
      details: data.details || null, // Any extra details
    };

    // Send the log to the backend, but don't wait for it or handle errors
    // This ensures the main app doesn't slow down if logging fails.
    fetch(`${API_BASE_URL}/api/activity-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logPayload),
    }).catch(error => {
      console.error("Failed to log activity:", error);
    });

  } catch (error) {
    console.error("Error in logging activity:", error);
  }
};
