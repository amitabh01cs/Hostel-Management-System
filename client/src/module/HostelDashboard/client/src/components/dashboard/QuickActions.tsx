import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { User, ClipboardCheck, CalendarCheck, Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

type QuickActionProps = {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  link?: string;        // for internal route via wouter
  onClick?: () => void; // for custom actions or external redirect
};

const QuickActionButton = ({
  title,
  icon,
  iconBg,
  iconColor,
  link,
  onClick,
}: QuickActionProps) => {
  const content = (
    <div
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-2", iconBg, iconColor)}>
        {icon}
      </div>
      <span className="text-sm text-gray-700">{title}</span>
    </div>
  );

  // If internal link and no onClick
  if (link && !onClick) {
    return <Link href={link}>{content}</Link>;
  }

  // Default: external link or custom logic
  return content;
};

const QuickActions = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            title="Add Student"
            icon={<User className="h-6 w-6" />}
            iconBg="bg-primary-100"
            iconColor="text-primary"
            onClick={() => {
              window.location.href = "https://backend-hostel-module-production-iist.up.railway.app/";
            }}
          />
          <QuickActionButton
            title="Take Attendance"
            icon={<ClipboardCheck className="h-6 w-6" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            link="/take-attendance"
          />
          <QuickActionButton
            title="View Leave Requests"
            icon={<CalendarCheck className="h-6 w-6" />}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            link="/request-leave"
          />
          <QuickActionButton
            title="Check Complaints"
            icon={<Inbox className="h-6 w-6" />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            link="/complaint-box"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
