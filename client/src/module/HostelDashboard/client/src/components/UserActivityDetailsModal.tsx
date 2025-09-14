import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

type Activity = {
  id: number;
  userId: string;
  pageUrl: string;
  actionType: string;
  actionDescription: string;
  timestamp: string;
};

type Props = {
  userId: string;
  open: boolean;
  onClose: () => void;
};

const UserActivityDetailsModal = ({ userId, open, onClose }: Props) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      fetch(
        `https://hostel-backend-module-production-iist.up.railway.app/api/user-activities/${userId}`
      )
        .then((res) => res.json())
        .then((data) => {
          setActivities(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, userId]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // close on background click
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          width: "80%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "20px",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()} // prevent modal close on content click
      >
        <h3>User Activity Details</h3>
        {loading && <p>Loading...</p>}
        {!loading && activities.length === 0 && <p>No activities found.</p>}
        <ul>
          {activities.map((act) => (
            <li key={act.id}>
              <strong>{new Date(act.timestamp).toLocaleString()}</strong> |{" "}
              {act.pageUrl} | {act.actionType} | {act.actionDescription}
            </li>
          ))}
        </ul>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default UserActivityDetailsModal;
