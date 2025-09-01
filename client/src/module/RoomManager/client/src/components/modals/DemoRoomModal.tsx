import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";


interface DemoRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoRoomImg: string;
}


const DemoRoomModal = ({ isOpen, onClose, demoRoomImg }: DemoRoomModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Room Layout Visualization</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
       
        <div className="flex justify-center p-4">
          <img
            src={demoRoomImg}
            alt="Room layout diagram"
            className="w-full h-auto rounded-lg border"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1541004995602-b3e898709909?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600";
              e.currentTarget.alt = "Placeholder room image (demo image not available)";
            }}
          />
        </div>
       
        <DialogFooter className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default DemoRoomModal;


