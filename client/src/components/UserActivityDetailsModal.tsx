import { useEffect, useState } from "react";
import { Modal } from "./ui/modal"; // Assume you have a Modal component
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
      fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/user-activities/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setActivities(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, userId]);

  return (
    <Modal open={open} onClose={onClose}>
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
    </Modal>
  );
};

export default UserActivityDetailsModal;
