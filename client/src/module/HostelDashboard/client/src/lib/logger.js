// YE POORA CODE COPY-PASTE KAREIN
const API_BASE_URL = "https://hostel-backend-module-production-iist.up.railway.app";

export const logActivity = (action, data = {}) => {
  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      // User logged in nahi hai, to log nahi karna
      return;
    }
    const userData = JSON.parse(userString);

    const logPayload = {
      userId: String(userData.id), // Ensure userId is a string
      userEmail: userData.email,
      userType: userData.role,
      action: action, // e.g., 'PAGE_VIEW'
      pageUrl: window.location.pathname, // Current page ka URL
      details: data.details || null, // Extra details
    };

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
