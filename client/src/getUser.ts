export function getCurrentUser() {
  const studentUser = JSON.parse(localStorage.getItem("studentUser") || "null");
  if (studentUser && studentUser.studentId) {
    return {
      userId: studentUser.studentId,
      userEmail: studentUser.email,
      userType: "STUDENT"
    };
  }

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  if (adminUser && adminUser.adminId) {
    return {
      userId: adminUser.adminId,
      userEmail: adminUser.email,
      userType: adminUser.adminType || "ADMIN"
    };
  }

  const securityUser = JSON.parse(localStorage.getItem("securityUser") || "null");
  if (securityUser && securityUser.securityId) {
    return {
      userId: securityUser.securityId,
      userEmail: securityUser.email,
      userType: "SECURITY"
    };
  }

  return null; // koi user nahi mila
}
