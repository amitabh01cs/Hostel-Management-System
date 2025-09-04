import { useState, useEffect } from "react";

function UserActivityLogsTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("https://your-backend.com/api/activity-logs") // <-- Yahan backend ka sahi URL daalo
      .then(res => res.json())
      .then(data => setLogs(data.logs || data))
      .catch(err => setLogs([]));
  }, []);

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Sr No.</th>
          <th>User ID</th>
          <th>Email</th>
          <th>Action Type</th>
          <th>Page URL/Name</th>
          <th>Description</th>
          <th>Time</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, idx) => (
          <tr key={log.id || idx}>
            <td>{idx + 1}</td>
            <td>{log.userId}</td>
            <td>{log.userEmail}</td>
            <td>{log.actionType}</td>
            <td>{log.pageUrl}</td>
            <td>{log.actionDescription}</td>
            <td>{log.time}</td>
            <td>{log.ipAddress}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default UserActivityLogsTable;
