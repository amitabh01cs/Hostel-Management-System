import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCircle2, AlertCircle, User, BellRing } from "lucide-react";
import { cn } from "../../lib/utils";

type ActivityItem = {
  id: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  timestamp: string;
};

const activities: ActivityItem[] = [
  {
    id: 1,
    icon: <User className="h-4 w-4" />,
    iconColor: "text-primary",
    iconBg: "bg-blue-100",
    title: "New student registered",
    timestamp: "10 minutes ago",
  },
  {
    id: 2,
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    title: "Leave request approved",
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    icon: <AlertCircle className="h-4 w-4" />,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    title: "New complaint submitted",
    timestamp: "3 hours ago",
  },
  {
    id: 4,
    icon: <BellRing className="h-4 w-4" />,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    title: "Room maintenance scheduled",
    timestamp: "Yesterday",
  },
];

const ActivityList = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center mr-3", activity.iconBg, activity.iconColor)}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ActivityList;
