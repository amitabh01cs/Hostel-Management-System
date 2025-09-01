// import { TooltipProvider } from "../components/ui/tooltip";
// import HostelRoomManagement from "../../pages/HostelRoomManagement";
import { TooltipProvider } from "../src/components/ui/tooltip";
import HostelRoomManagement from "../src/pages/HostelRoomManagement";

function Index2() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <main className="p-4">
          <HostelRoomManagement />
        </main>
      </div>
    </TooltipProvider>
  );
}

export default Index2;