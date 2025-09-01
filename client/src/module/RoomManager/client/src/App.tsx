import { TooltipProvider } from "@/components/ui/tooltip";
import HostelRoomManagement from "@/pages/HostelRoomManagement";

function App() {
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

export default App;