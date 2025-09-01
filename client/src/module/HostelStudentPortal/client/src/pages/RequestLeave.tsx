import { Construction } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export default function RequestLeave() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Leave</h1>
        <p className="text-gray-600 mt-2">Submit a new leave request</p>
      </div>
      
      <Card>
        <CardContent className="p-8">
          <div className="text-center py-16">
            <Construction className="w-24 h-24 text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Page Under Construction</h3>
            <p className="text-gray-500">This section will be added manually later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
